use super::State;
use actix_web::web;
use rpc::error::{HTTPError, HttpResult};
use serde::{Deserialize, Serialize};
use zk_circuits::{
    constants::MERKLE_TREE_DEPTH,
    data::{InputNote, MerklePath, Note, SnarkWitness, Utxo, UtxoKind},
    CircuitKind,
};
use zk_primitives::Element;

/// Request to generate a transfer proof
#[derive(Debug, Deserialize)]
pub struct ProveTransferRequest {
    /// Secret key of the sender (hex string, 32 bytes)
    pub secret_key: String,
    /// Input notes to spend
    pub inputs: Vec<InputNoteRequest>,
    /// Output notes to create  
    pub outputs: Vec<OutputNoteRequest>,
    /// Current merkle root (hex string)
    pub merkle_root: String,
    /// Transaction kind: "transfer", "mint", or "burn" (defaults to auto-detect)
    #[serde(default)]
    pub kind: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct InputNoteRequest {
    /// Address (public key derived from secret) - hex string
    pub address: String,
    /// Psi (randomness) - hex string
    pub psi: String,
    /// Value in smallest units (as string to handle large numbers)
    pub value: String,
    /// Token identifier
    pub token: String,
    /// Source address - hex string
    pub source: String,
    /// Merkle path siblings - array of hex strings
    pub merkle_path: Vec<String>,
}

#[derive(Debug, Deserialize)]
pub struct OutputNoteRequest {
    /// Recipient address - hex string
    pub address: String,
    /// Psi (randomness) - hex string
    pub psi: String,
    /// Value in smallest units
    pub value: String,
    /// Token identifier
    pub token: String,
    /// Source address - hex string
    pub source: String,
}

#[derive(Debug, Serialize)]
pub struct ProveTransferResponse {
    pub snark: SnarkWitness,
}

#[derive(Debug, Serialize)]
pub struct DeriveAddressResponse {
    pub address: String,
}

#[derive(Debug, Deserialize)]
pub struct DeriveAddressRequest {
    pub secret_key: String,
}

fn hex_to_element(hex: &str) -> Result<Element, HTTPError> {
    let hex = hex.strip_prefix("0x").unwrap_or(hex);
    let bytes = hex::decode(hex).map_err(|e| {
        HTTPError::bad_request(
            &format!("Invalid hex string: {}", e),
            None,
            None::<()>,
        )
    })?;
    
    if bytes.len() != 32 {
        return Err(HTTPError::bad_request(
            &format!("Expected 32 bytes, got {}", bytes.len()),
            None,
            None::<()>,
        ));
    }
    
    let arr: [u8; 32] = bytes.try_into().unwrap();
    Ok(Element::from_be_bytes(arr))
}

fn element_to_hex(element: Element) -> String {
    format!("0x{}", hex::encode(element.to_be_bytes()))
}

fn parse_input_note(
    input: &InputNoteRequest,
    secret_key: Element,
) -> Result<InputNote<MERKLE_TREE_DEPTH>, HTTPError> {
    let note = Note {
        address: hex_to_element(&input.address)?,
        psi: hex_to_element(&input.psi)?,
        value: hex_to_element(&input.value)?,
        token: input.token.clone(),
        source: hex_to_element(&input.source)?,
    };

    let siblings: Result<Vec<Element>, HTTPError> = input
        .merkle_path
        .iter()
        .map(|s| hex_to_element(s))
        .collect();

    Ok(InputNote {
        note,
        secret_key,
        merkle_path: MerklePath {
            siblings: siblings?,
        },
    })
}

fn parse_output_note(output: &OutputNoteRequest) -> Result<Note, HTTPError> {
    Ok(Note {
        address: hex_to_element(&output.address)?,
        psi: hex_to_element(&output.psi)?,
        value: hex_to_element(&output.value)?,
        token: output.token.clone(),
        source: hex_to_element(&output.source)?,
    })
}

/// Generate a ZK proof for a transfer transaction
/// 
/// POST /v0/prove/transfer
#[tracing::instrument(err, skip_all)]
pub async fn prove_transfer(
    _state: web::Data<State>,
    web::Json(req): web::Json<ProveTransferRequest>,
) -> HttpResult<web::Json<ProveTransferResponse>> {
    tracing::info!(method = "prove_transfer", "Incoming proof request");

    // Parse secret key
    let secret_key = hex_to_element(&req.secret_key)?;

    // Parse merkle root
    let merkle_root = hex_to_element(&req.merkle_root)?;

    // Parse input notes (UTXO circuit requires exactly 2)
    let mut input_notes: [InputNote<MERKLE_TREE_DEPTH>; 2] =
        core::array::from_fn(|_| InputNote::padding_note());

    for (i, note_input) in req.inputs.iter().take(2).enumerate() {
        input_notes[i] = parse_input_note(note_input, secret_key)?;
    }

    // Parse output notes (UTXO circuit requires exactly 2)
    let mut output_notes: [Note; 2] = core::array::from_fn(|_| Note::padding_note());

    for (i, note_output) in req.outputs.iter().take(2).enumerate() {
        output_notes[i] = parse_output_note(note_output)?;
    }

    // Determine transaction kind
    let kind = match req.kind.as_deref() {
        Some("mint") => UtxoKind::Mint,
        Some("burn") => UtxoKind::Burn,
        Some("transfer") => UtxoKind::Transfer,
        _ => {
            // Auto-detect based on inputs/outputs
            if req.inputs.is_empty() {
                UtxoKind::Mint
            } else if req.outputs.iter().all(|o| o.value == "0x" .to_string() + &"0".repeat(64)) {
                UtxoKind::Burn
            } else {
                UtxoKind::Transfer
            }
        }
    };

    tracing::info!(method = "prove_transfer", ?kind, "Creating UTXO proof");

    // Create UTXO and generate proof
    let utxo = Utxo::<MERKLE_TREE_DEPTH>::new(
        input_notes,
        output_notes,
        merkle_root,
        kind,
    );

    // Generate the proof (this is CPU-intensive)
    let snark = tokio::task::spawn_blocking(move || {
        utxo.snark(CircuitKind::Utxo)
    })
    .await
    .map_err(|e| HTTPError::internal(e.into()))?
    .map_err(|e| HTTPError::internal(e.into()))?;

    let witness = snark.to_witness();

    Ok(web::Json(ProveTransferResponse {
        snark: SnarkWitness::V1(witness),
    }))
}

/// Derive a public address from a secret key
/// 
/// POST /v0/prove/derive-address
#[tracing::instrument(err, skip_all)]
pub async fn derive_address(
    web::Json(req): web::Json<DeriveAddressRequest>,
) -> HttpResult<web::Json<DeriveAddressResponse>> {
    let secret_key = hex_to_element(&req.secret_key)?;
    
    // Address is hash(secret_key, 0) - same as in the circuit
    let address = smirk::hash_merge([secret_key, Element::ZERO]);
    
    Ok(web::Json(DeriveAddressResponse {
        address: element_to_hex(address),
    }))
}

/// Generate a random psi value for a new note
/// 
/// GET /v0/prove/generate-psi
#[tracing::instrument(err, skip_all)]
pub async fn generate_psi() -> HttpResult<web::Json<serde_json::Value>> {
    use rand::RngCore;
    let mut rng = rand::thread_rng();
    let mut bytes = [0u8; 32];
    rng.fill_bytes(&mut bytes);
    
    Ok(web::Json(serde_json::json!({
        "psi": format!("0x{}", hex::encode(bytes))
    })))
}

/// Calculate the commitment (leaf hash) for a note
/// 
/// POST /v0/prove/commitment
#[derive(Debug, Deserialize)]
pub struct CommitmentRequest {
    pub address: String,
    pub psi: String,
    pub value: String,
    pub token: String,
    pub source: String,
}

#[tracing::instrument(err, skip_all)]
pub async fn calculate_commitment(
    web::Json(req): web::Json<CommitmentRequest>,
) -> HttpResult<web::Json<serde_json::Value>> {
    let note = Note {
        address: hex_to_element(&req.address)?,
        psi: hex_to_element(&req.psi)?,
        value: hex_to_element(&req.value)?,
        token: req.token,
        source: hex_to_element(&req.source)?,
    };
    
    let commitment = note.commitment();
    
    Ok(web::Json(serde_json::json!({
        "commitment": element_to_hex(commitment)
    })))
}

/// Faucet request - mint test tokens for development
#[derive(Debug, Deserialize)]
pub struct FaucetRequest {
    /// Recipient address (hex string)
    pub address: String,
    /// Amount to mint (in smallest units, e.g., 1000000 = $1 with 6 decimals)
    #[serde(default = "default_faucet_amount")]
    pub amount: u64,
}

fn default_faucet_amount() -> u64 {
    100_000_000 // $100 with 6 decimals
}

#[derive(Debug, Serialize)]
pub struct FaucetResponse {
    pub success: bool,
    pub amount: u64,
    pub note: FaucetNoteInfo,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub snark: Option<SnarkWitness>,
}

#[derive(Debug, Serialize)]
pub struct FaucetNoteInfo {
    pub address: String,
    pub psi: String,
    pub value: String,
    pub commitment: String,
}

/// Mint test tokens (faucet for development)
/// 
/// POST /v0/prove/faucet
/// 
/// This is a DEV-ONLY endpoint that directly inserts notes into the merkle tree
/// without requiring Ethereum contract interaction. For production, use the
/// proper mint flow through the rollup contract.
#[tracing::instrument(err, skip_all)]
pub async fn faucet(
    state: web::Data<State>,
    web::Json(req): web::Json<FaucetRequest>,
) -> HttpResult<web::Json<FaucetResponse>> {
    tracing::info!(method = "faucet", address = %req.address, amount = req.amount, "Faucet request (dev mode)");

    let address = hex_to_element(&req.address)?;
    
    // Create value as Element
    let value = Element::from(req.amount);
    
    // Create a new note for the recipient
    let note = Note::new(address, value);
    let commitment = note.commitment();
    let psi = note.psi();

    // DEV MODE: Directly insert the note commitment into the merkle tree
    // This bypasses the normal mint flow which requires Ethereum contract interaction
    {
        let mut notes_tree = state.node.notes_tree().write();
        let metadata = prover::smirk_metadata::SmirkMetadata::inserted_in(state.node.height().0);
        let batch = smirk::Batch::from_entries(vec![(commitment, metadata)].into_iter())
            .map_err(|e| HTTPError::internal(Box::new(e) as Box<dyn std::error::Error + Send + Sync>))?;
        notes_tree.insert_batch(batch)
            .map_err(|e| HTTPError::internal(Box::new(e) as Box<dyn std::error::Error + Send + Sync>))?;
    }

    tracing::info!(
        method = "faucet",
        commitment = %element_to_hex(commitment),
        "Note inserted into merkle tree (dev mode)"
    );

    Ok(web::Json(FaucetResponse {
        success: true,
        amount: req.amount,
        note: FaucetNoteInfo {
            address: element_to_hex(address),
            psi: element_to_hex(psi),
            value: element_to_hex(value),
            commitment: element_to_hex(commitment),
        },
        // No snark needed for dev mode - we're directly inserting
        snark: None,
    }))
}

/// Get merkle paths for note commitments along with current root
/// 
/// POST /v0/prove/merkle-paths
#[derive(Debug, Deserialize)]
pub struct MerklePathsRequest {
    /// List of note commitments (hex strings)
    pub commitments: Vec<String>,
}

#[derive(Debug, Serialize)]
pub struct MerklePathsResponse {
    /// Current merkle root
    pub root: String,
    /// Merkle paths for each commitment
    pub paths: Vec<MerklePathInfo>,
}

#[derive(Debug, Serialize)]
pub struct MerklePathInfo {
    pub commitment: String,
    pub path: Vec<String>,
    pub found: bool,
}

#[tracing::instrument(err, skip_all)]
pub async fn get_merkle_paths_for_notes(
    state: web::Data<State>,
    web::Json(req): web::Json<MerklePathsRequest>,
) -> HttpResult<web::Json<MerklePathsResponse>> {
    tracing::info!(method = "get_merkle_paths_for_notes", count = req.commitments.len(), "Getting merkle paths");

    // Get current root
    let root = state.node.root_hash();
    
    let mut paths = Vec::new();
    
    for commitment_hex in &req.commitments {
        let commitment = hex_to_element(commitment_hex)?;
        
        // Try to get merkle path for this commitment
        match state.node.get_merkle_paths(&[commitment]) {
            Ok(merkle_paths) if !merkle_paths.is_empty() && !merkle_paths[0].is_empty() => {
                let path: Vec<String> = merkle_paths[0]
                    .iter()
                    .map(|e| element_to_hex(*e))
                    .collect();
                
                paths.push(MerklePathInfo {
                    commitment: commitment_hex.clone(),
                    path,
                    found: true,
                });
            }
            _ => {
                paths.push(MerklePathInfo {
                    commitment: commitment_hex.clone(),
                    path: vec![],
                    found: false,
                });
            }
        }
    }

    Ok(web::Json(MerklePathsResponse {
        root: element_to_hex(root),
        paths,
    }))
}
