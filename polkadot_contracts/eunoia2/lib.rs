#![cfg_attr(not(feature = "std"), no_std, no_main)]

#[ink::contract]
pub mod eunoia {
    use ink::prelude::string::String;
    use ink::primitives::U256;
    use core::u64;
    use ink::primitives::Address as otherAddress;

    #[ink(storage)]
    pub struct Eunoia {
        value: bool,
    }

    pub struct HistoryEntry{
        charity_name: String,
        coin_name: String, 
        amount_donated: U256,
        donor_address: otherAddress,
        timestamp: u64,
    }

    impl Eunoia {
        #[ink(constructor)]
        pub fn new(init_value: bool) -> Self {
            Self { value: init_value }
        }

        #[ink(constructor)]
        pub fn new_default() -> Self {
            Self::new(Default::default())
        }

        #[ink(message)]
        pub fn flip(&mut self) {
            self.value = !self.value;
        }

        #[ink(message)]
        pub fn get(&self) -> bool {
            self.value
        }

        #[ink(message)]
        pub fn give_me(&mut self, value: U256) {
            assert!(value <= self.env().balance(), "insufficient funds!");

            if self.env().transfer(self.env().caller(), value).is_err() {
                panic!(
                    "requested transfer failed. this can be the case if the contract does not\
                    have sufficient free funds or if the transfer would have brought the\
                    contract's balance below minimum balance."
                )
            }
        }

        #[ink(message)]
        pub fn give_to(&mut self, to: otherAddress, value: U256) {
            assert!(value <= self.env().balance(), "insufficient funds!");

            if self.env().transfer(to, value).is_err() {
                panic!(
                    "requested transfer failed. This can be the case if the contract does not \
                    have sufficient free funds or if the transfer would have brought the \
                    contract's balance below minimum balance."
                )
            }
        }
    }

    #[cfg(test)]
    mod tests {
        use super::*;

        #[ink::test]
        fn default_works() {
            let eunoia = Eunoia::new_default();
            assert!(!eunoia.get());
        }

        #[ink::test]
        fn it_works() {
            let mut eunoia = Eunoia::new(false);
            assert!(!eunoia.get());
            eunoia.flip();
            assert!(eunoia.get());
        }
    }

    #[cfg(all(test, feature = "e2e-tests"))]
    mod e2e_tests {
        use super::*;
        use ink_e2e::ContractsBackend;

        type E2EResult<T> = std::result::Result<T, Box<dyn std::error::Error>>;

        #[ink_e2e::test]
        async fn it_works<Client: E2EBackend>(mut client: Client) -> E2EResult<()> {
            // given
            let mut constructor = EunoiaRef::new(false);
            let contract = client
                .instantiate("eunoia", &ink_e2e::bob(), &mut constructor)
                .submit()
                .await
                .expect("instantiate failed");
            let mut call_builder = contract.call_builder::<Eunoia>();

            let get = call_builder.get();
            let get_res = client.call(&ink_e2e::bob(), &get).submit().await?;
            assert!(!get_res.return_value());

            // when
            let flip = call_builder.flip();
            let _flip_res = client
                .call(&ink_e2e::bob(), &flip)
                .submit()
                .await
                .expect("flip failed");

            // then
            let get = call_builder.get();
            let get_res = client.call(&ink_e2e::bob(), &get).dry_run().await?;
            assert!(get_res.return_value());

            Ok(())
        }

        #[ink_e2e::test]
        async fn default_works<Client: E2EBackend>(mut client: Client) -> E2EResult<()> {
            // given
            let mut constructor = EunoiaRef::new_default();

            // when
            let contract = client
                .instantiate("eunoia", &ink_e2e::bob(), &mut constructor)
                .submit()
                .await
                .expect("instantiate failed");
            let call_builder = contract.call_builder::<Eunoia>();

            // then
            let get = call_builder.get();
            let get_res = client.call(&ink_e2e::bob(), &get).dry_run().await?;
            assert!(!get_res.return_value());

            Ok(())
        }
        
        #[ink_e2e::test]
        #[ignore]
        async fn e2e_test_deployed_contract<Client: E2EBackend>(
            mut client: Client,
        ) -> E2EResult<()> {
            // given
            use ink::H160;
            let addr = std::env::var("CONTRACT_ADDR_HEX")
                .unwrap()
                .replace("0x", "");
            let addr_bytes: Vec<u8> = hex::decode(addr).unwrap();
            let addr = H160::from_slice(&addr_bytes[..]);

            use std::str::FromStr;
            let suri = ink_e2e::subxt_signer::SecretUri::from_str("//Alice").unwrap();
            let caller = ink_e2e::Keypair::from_uri(&suri).unwrap();

            // when
            // Invoke `Flipper::get()` from `caller`'s account
            let call_builder = ink_e2e::create_call_builder::<Eunoia>(addr);
            let get = call_builder.get();
            let get_res = client.call(&caller, &get).dry_run().await?;

            // then
            assert!(get_res.return_value());

            Ok(())
        }
    }
}