//! Payment Links API
//! 
//! Handles creation, validation, and claiming of ZK payment links.
//! Payment links allow users to send payments via shareable URLs.

use actix_web::{web, HttpResponse};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::RwLock;
use std::time::{SystemTime, UNIX_EPOCH};

use super::State;

/// In-memory storage for payment links (use Redis/DB in production)
lazy_static::lazy_static! {
    static ref PAYMENT_LINKS: RwLock<HashMap<String, PaymentLink>> = RwLock::new(HashMap::new());
}

/// Payment link status
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "lowercase")]
pub enum PaymentLinkStatus {
    Pending,
    Claimed,
    Expired,
    Cancelled,
    Failed,
}

/// Payment link data stored on the server
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PaymentLink {
    pub payment_id: String,
    pub amount_cents: u64,
    pub currency: String,
    pub recipient: String,
    pub recipient_name: Option<String>,
    pub note: Option<String>,
    pub created_at: u64,
    pub expires_at: u64,
    pub signature: String,
    pub status: PaymentLinkStatus,
    pub claimed_by: Option<String>,
    pub claimed_at: Option<u64>,
    pub version: u32,
}

/// Request to create a payment link
#[derive(Debug, Deserialize)]
pub struct CreatePaymentLinkRequest {
    pub payment_id: String,
    pub amount_cents: u64,
    pub currency: Option<String>,
    pub recipient: String,
    pub recipient_name: Option<String>,
    pub note: Option<String>,
    pub expires_at: u64,
    pub signature: String,
    pub version: Option<u32>,
}

/// Response after creating a payment link
#[derive(Debug, Serialize)]
pub struct CreatePaymentLinkResponse {
    pub success: bool,
    pub payment_id: String,
    pub message: String,
}

/// Request to validate a payment link
#[derive(Debug, Deserialize)]
pub struct ValidatePaymentLinkRequest {
    pub amount_cents: u64,
    pub currency: Option<String>,
    pub recipient: String,
    pub expires_at: u64,
    pub signature: Option<String>,
}

/// Response for validation
#[derive(Debug, Serialize)]
pub struct ValidatePaymentLinkResponse {
    pub valid: bool,
    pub status: PaymentLinkStatus,
    pub is_expired: bool,
    pub message: String,
}

/// Request to claim a payment link
#[derive(Debug, Deserialize)]
pub struct ClaimPaymentLinkRequest {
    pub claimer_address: String,
    pub claimer_public_key: Option<String>,
    pub proof: Option<String>, // ZK proof of authorization
}

/// Response after claiming
#[derive(Debug, Serialize)]
pub struct ClaimPaymentLinkResponse {
    pub success: bool,
    pub amount_cents: u64,
    pub transaction_id: Option<String>,
    pub message: String,
}

/// Request to cancel a payment link
#[derive(Debug, Deserialize)]
pub struct CancelPaymentLinkRequest {
    pub signature: String,
    pub recipient: String,
}

/// Request for generating a claim proof
#[derive(Debug, Deserialize)]
pub struct GenerateClaimProofRequest {
    pub claimer_address: String,
    pub claimer_secret_key: Option<String>,
    pub amount_cents: u64,
}

/// Response with generated proof
#[derive(Debug, Serialize)]
pub struct GenerateClaimProofResponse {
    pub success: bool,
    pub proof: Option<String>,
    pub message: String,
}

/// Query parameters for listing payment links
#[derive(Debug, Deserialize)]
pub struct ListPaymentLinksQuery {
    pub address: Option<String>,
    pub status: Option<String>,
    pub r#type: Option<String>, // 'sent' or 'received'
    pub limit: Option<u32>,
    pub offset: Option<u32>,
}

fn current_timestamp() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_millis() as u64
}

/// Create a new payment link
pub async fn create_payment_link(
    _state: web::Data<State>,
    body: web::Json<CreatePaymentLinkRequest>,
) -> HttpResponse {
    let req = body.into_inner();
    
    // Validate expiration
    if req.expires_at <= current_timestamp() {
        return HttpResponse::BadRequest().json(CreatePaymentLinkResponse {
            success: false,
            payment_id: req.payment_id,
            message: "Payment link already expired".to_string(),
        });
    }
    
    // Create payment link
    let payment_link = PaymentLink {
        payment_id: req.payment_id.clone(),
        amount_cents: req.amount_cents,
        currency: req.currency.unwrap_or_else(|| "USD".to_string()),
        recipient: req.recipient,
        recipient_name: req.recipient_name,
        note: req.note,
        created_at: current_timestamp(),
        expires_at: req.expires_at,
        signature: req.signature,
        status: PaymentLinkStatus::Pending,
        claimed_by: None,
        claimed_at: None,
        version: req.version.unwrap_or(1),
    };
    
    // Store payment link
    {
        let mut links = PAYMENT_LINKS.write().unwrap();
        links.insert(req.payment_id.clone(), payment_link);
    }
    
    HttpResponse::Created().json(CreatePaymentLinkResponse {
        success: true,
        payment_id: req.payment_id,
        message: "Payment link created successfully".to_string(),
    })
}

/// Get a payment link by ID
pub async fn get_payment_link(
    _state: web::Data<State>,
    path: web::Path<String>,
) -> HttpResponse {
    let payment_id = path.into_inner();
    
    let links = PAYMENT_LINKS.read().unwrap();
    
    match links.get(&payment_id) {
        Some(link) => {
            let mut link = link.clone();
            
            // Update status if expired
            if link.status == PaymentLinkStatus::Pending && current_timestamp() > link.expires_at {
                link.status = PaymentLinkStatus::Expired;
            }
            
            HttpResponse::Ok().json(link)
        }
        None => HttpResponse::NotFound().json(serde_json::json!({
            "error": "Payment link not found",
            "payment_id": payment_id,
        })),
    }
}

/// Validate a payment link
pub async fn validate_payment_link(
    _state: web::Data<State>,
    path: web::Path<String>,
    body: web::Json<ValidatePaymentLinkRequest>,
) -> HttpResponse {
    let payment_id = path.into_inner();
    let req = body.into_inner();
    
    let links = PAYMENT_LINKS.read().unwrap();
    
    match links.get(&payment_id) {
        Some(link) => {
            let now = current_timestamp();
            let is_expired = now > link.expires_at;
            
            // Validate parameters match
            let params_match = link.amount_cents == req.amount_cents
                && link.recipient == req.recipient
                && link.expires_at == req.expires_at;
            
            if !params_match {
                return HttpResponse::BadRequest().json(ValidatePaymentLinkResponse {
                    valid: false,
                    status: link.status.clone(),
                    is_expired,
                    message: "Payment link parameters do not match".to_string(),
                });
            }
            
            if is_expired {
                return HttpResponse::Ok().json(ValidatePaymentLinkResponse {
                    valid: false,
                    status: PaymentLinkStatus::Expired,
                    is_expired: true,
                    message: "Payment link has expired".to_string(),
                });
            }
            
            if link.status != PaymentLinkStatus::Pending {
                return HttpResponse::Ok().json(ValidatePaymentLinkResponse {
                    valid: false,
                    status: link.status.clone(),
                    is_expired,
                    message: format!("Payment link is {:?}", link.status),
                });
            }
            
            HttpResponse::Ok().json(ValidatePaymentLinkResponse {
                valid: true,
                status: PaymentLinkStatus::Pending,
                is_expired: false,
                message: "Payment link is valid".to_string(),
            })
        }
        None => HttpResponse::NotFound().json(ValidatePaymentLinkResponse {
            valid: false,
            status: PaymentLinkStatus::Failed,
            is_expired: false,
            message: "Payment link not found".to_string(),
        }),
    }
}

/// Claim a payment link
pub async fn claim_payment_link(
    _state: web::Data<State>,
    path: web::Path<String>,
    body: web::Json<ClaimPaymentLinkRequest>,
) -> HttpResponse {
    let payment_id = path.into_inner();
    let req = body.into_inner();
    
    let mut links = PAYMENT_LINKS.write().unwrap();
    
    match links.get_mut(&payment_id) {
        Some(link) => {
            let now = current_timestamp();
            
            // Check if expired
            if now > link.expires_at {
                link.status = PaymentLinkStatus::Expired;
                return HttpResponse::BadRequest().json(ClaimPaymentLinkResponse {
                    success: false,
                    amount_cents: link.amount_cents,
                    transaction_id: None,
                    message: "Payment link has expired".to_string(),
                });
            }
            
            // Check if already claimed
            if link.status != PaymentLinkStatus::Pending {
                return HttpResponse::BadRequest().json(ClaimPaymentLinkResponse {
                    success: false,
                    amount_cents: link.amount_cents,
                    transaction_id: None,
                    message: format!("Payment link is already {:?}", link.status),
                });
            }
            
            // TODO: Verify ZK proof if provided
            // In production, this would verify the claimer is authorized
            
            // Mark as claimed
            link.status = PaymentLinkStatus::Claimed;
            link.claimed_by = Some(req.claimer_address);
            link.claimed_at = Some(now);
            
            // TODO: Initiate actual ZK transfer on-chain
            // This would use the zk-circuits to create and submit a transfer proof
            
            let transaction_id = format!("tx_{}", payment_id);
            
            HttpResponse::Ok().json(ClaimPaymentLinkResponse {
                success: true,
                amount_cents: link.amount_cents,
                transaction_id: Some(transaction_id),
                message: "Payment claimed successfully".to_string(),
            })
        }
        None => HttpResponse::NotFound().json(ClaimPaymentLinkResponse {
            success: false,
            amount_cents: 0,
            transaction_id: None,
            message: "Payment link not found".to_string(),
        }),
    }
}

/// Cancel a payment link
pub async fn cancel_payment_link(
    _state: web::Data<State>,
    path: web::Path<String>,
    body: web::Json<CancelPaymentLinkRequest>,
) -> HttpResponse {
    let payment_id = path.into_inner();
    let req = body.into_inner();
    
    let mut links = PAYMENT_LINKS.write().unwrap();
    
    match links.get_mut(&payment_id) {
        Some(link) => {
            // Verify the canceller is the creator
            if link.recipient != req.recipient {
                return HttpResponse::Forbidden().json(serde_json::json!({
                    "success": false,
                    "message": "Only the creator can cancel this payment link",
                }));
            }
            
            // Check if already claimed
            if link.status == PaymentLinkStatus::Claimed {
                return HttpResponse::BadRequest().json(serde_json::json!({
                    "success": false,
                    "message": "Cannot cancel a claimed payment link",
                }));
            }
            
            // Mark as cancelled
            link.status = PaymentLinkStatus::Cancelled;
            
            HttpResponse::Ok().json(serde_json::json!({
                "success": true,
                "payment_id": payment_id,
                "message": "Payment link cancelled successfully",
            }))
        }
        None => HttpResponse::NotFound().json(serde_json::json!({
            "success": false,
            "message": "Payment link not found",
        })),
    }
}

/// List payment links for a user
pub async fn list_payment_links(
    _state: web::Data<State>,
    query: web::Query<ListPaymentLinksQuery>,
) -> HttpResponse {
    let links = PAYMENT_LINKS.read().unwrap();
    let now = current_timestamp();
    
    let mut result: Vec<PaymentLink> = links
        .values()
        .filter(|link| {
            // Filter by address if provided
            if let Some(addr) = &query.address {
                if link.recipient != *addr && link.claimed_by.as_ref() != Some(addr) {
                    return false;
                }
            }
            
            // Filter by status if provided
            if let Some(status) = &query.status {
                let link_status = if link.status == PaymentLinkStatus::Pending && now > link.expires_at {
                    "expired"
                } else {
                    match &link.status {
                        PaymentLinkStatus::Pending => "pending",
                        PaymentLinkStatus::Claimed => "claimed",
                        PaymentLinkStatus::Expired => "expired",
                        PaymentLinkStatus::Cancelled => "cancelled",
                        PaymentLinkStatus::Failed => "failed",
                    }
                };
                if link_status != status {
                    return false;
                }
            }
            
            // Filter by type if provided
            if let Some(link_type) = &query.r#type {
                if let Some(addr) = &query.address {
                    match link_type.as_str() {
                        "sent" => {
                            if link.recipient != *addr {
                                return false;
                            }
                        }
                        "received" => {
                            if link.claimed_by.as_ref() != Some(addr) {
                                return false;
                            }
                        }
                        _ => {}
                    }
                }
            }
            
            true
        })
        .cloned()
        .collect();
    
    // Sort by created_at descending
    result.sort_by(|a, b| b.created_at.cmp(&a.created_at));
    
    // Apply pagination
    let offset = query.offset.unwrap_or(0) as usize;
    let limit = query.limit.unwrap_or(50) as usize;
    
    let paginated: Vec<PaymentLink> = result
        .into_iter()
        .skip(offset)
        .take(limit)
        .collect();
    
    HttpResponse::Ok().json(paginated)
}

/// Generate a ZK claim proof
pub async fn generate_claim_proof(
    _state: web::Data<State>,
    path: web::Path<String>,
    body: web::Json<GenerateClaimProofRequest>,
) -> HttpResponse {
    let payment_id = path.into_inner();
    let _req = body.into_inner();
    
    let links = PAYMENT_LINKS.read().unwrap();
    
    match links.get(&payment_id) {
        Some(link) => {
            if link.status != PaymentLinkStatus::Pending {
                return HttpResponse::BadRequest().json(GenerateClaimProofResponse {
                    success: false,
                    proof: None,
                    message: format!("Cannot generate proof for {:?} payment link", link.status),
                });
            }
            
            // TODO: Actually generate ZK proof using zk-circuits
            // This would use the claimer's secret key to generate a valid claim proof
            // For now, return a placeholder
            
            let mock_proof = format!("zkproof_{}_{}", payment_id, current_timestamp());
            
            HttpResponse::Ok().json(GenerateClaimProofResponse {
                success: true,
                proof: Some(mock_proof),
                message: "Proof generated successfully".to_string(),
            })
        }
        None => HttpResponse::NotFound().json(GenerateClaimProofResponse {
            success: false,
            proof: None,
            message: "Payment link not found".to_string(),
        }),
    }
}
