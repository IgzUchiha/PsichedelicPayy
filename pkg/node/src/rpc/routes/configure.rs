use super::{blocks, element, health, height, merkle, payment_links, prove, stats, txn, State};
use actix_web::web;

pub fn configure_routes(state: State) -> Box<dyn FnOnce(&mut web::ServiceConfig)> {
    Box::new(move |cfg: &mut web::ServiceConfig| {
        cfg.app_data(web::Data::new(state))
            .service(web::resource("/health").get(health::get_health))
            .service(web::resource("/height").get(height::get_height))
            .service(web::resource("/merkle").get(merkle::get_merkle_paths))
            .service(web::resource("/elements/{element}").get(element::get_element))
            .service(web::resource("/elements").get(element::list_elements))
            .service(web::resource("/blocks/{block}").get(blocks::get_block))
            .service(web::resource("/blocks").get(blocks::list_blocks))
            .service(web::resource("/transaction").post(txn::submit_txn))
            .service(web::resource("/transactions/{hash}").get(txn::get_txn))
            .service(
                web::resource("/transactions")
                    .get(txn::list_txns)
                    .post(txn::submit_txn),
            )
            .service(web::resource("/stats").get(stats::get_stats))
            // Proving endpoints for mobile wallet
            .service(web::resource("/prove/transfer").post(prove::prove_transfer))
            .service(web::resource("/prove/derive-address").post(prove::derive_address))
            .service(web::resource("/prove/generate-psi").get(prove::generate_psi))
            .service(web::resource("/prove/commitment").post(prove::calculate_commitment))
            .service(web::resource("/prove/faucet").post(prove::faucet))
            .service(web::resource("/prove/merkle-paths").post(prove::get_merkle_paths_for_notes))
            // Payment Links API
            .service(
                web::resource("/payment-links")
                    .get(payment_links::list_payment_links)
                    .post(payment_links::create_payment_link),
            )
            .service(
                web::resource("/payment-links/{payment_id}")
                    .get(payment_links::get_payment_link),
            )
            .service(
                web::resource("/payment-links/{payment_id}/validate")
                    .post(payment_links::validate_payment_link),
            )
            .service(
                web::resource("/payment-links/{payment_id}/claim")
                    .post(payment_links::claim_payment_link),
            )
            .service(
                web::resource("/payment-links/{payment_id}/cancel")
                    .post(payment_links::cancel_payment_link),
            )
            .service(
                web::resource("/payment-links/{payment_id}/generate-proof")
                    .post(payment_links::generate_claim_proof),
            );
    })
}
