#![cfg_attr(not(feature = "std"), no_std, no_main)]

#[ink::contract]
pub mod eunoia {
    use ink::prelude::string::String;
    use ink::primitives::U256;
    use core::u64;
    use ink::primitives::Address as address;
    use ink::storage::Mapping;
    use ink::env::Timestamp as timestamp;
    use ink::prelude::vec::Vec;
    // use ink::primitives::AccountIdMapper;

    pub struct HistoryEntry{
        charity_name: String,
        coin_name: String, 
        amount_donated: U256,
        donor_address: address,
        timestamp: timestamp,
    }

    pub struct Charity{
        name: String,
        description: String,
        wallet_address: address,
        total_donated: U256,
        donation_history: Vec<HistoryEntry>,
    }

    // #[ink(event)]
    pub struct Transferred {
        from: Option<AccountId>,
        to: Option<AccountId>,
        value: Balance,
    }

    #[ink(storage)]
    pub struct Eunoia {
        value: bool,
        owner: address,
        // histories: Mapping<(AccountId, u32), HistoryEntry>,
        history_count: Mapping<AccountId, u32>,   
        charity_wallets: Mapping<String, address>,
        charity_raised_amounts: Mapping<(String, String), U256>,
    }

    impl Eunoia {
        #[ink(constructor, payable)]
        pub fn new() -> Self {
            Self {
                value: false,
                owner: Self::env().caller(),
                history_count: Mapping::default(),
                charity_wallets: Mapping::default(),
                charity_raised_amounts: Mapping::default(),
            }
        }

        // #[ink(constructor)]
        // pub fn new(init_value: bool) -> Self {
        //     Self {
        //         value: init_value,
        //         owner: Self::env().caller(),
        //         history_count: Mapping::default(),
        //         charity_wallets: Mapping::default(),
        //         charity_raised_amounts: Mapping::default(),
        //     }
        // }

        // #[ink(constructor)]
        // pub fn new_default() -> Self {
        //     Self::new(Default::default())
        // }

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

        // #[ink(message)]
        // pub fn give_to(&mut self, from: AccountId, to: AccountId, value: U256) {
        //     let toAddr = ink::primitives::AccountIdMapper::to_address(&to);

        //     if self.env().transfer(toAddr, value).is_err() {
        //         panic!(
        //             "requested transfer failed. This can be the case if the contract does not \
        //             have sufficient free funds or if the transfer would have brought the \
        //             contract's balance below minimum balance."
        //         )
        //     }
        // }
    }
}
