use ink::prelude::string::String;
use ink::prelude::vec::Vec;
use ink::storage::Mapping;

/// Eunoia Foundation charity donation platform for Polkadot/Westend
#[ink::contract]
pub mod eunoia_foundation {
    use super::*;

    /// Represents a single donation event
    #[derive(scale::Encode, scale::Decode)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo, ink::storage::traits::StorageLayout))]
    pub struct HistoryEntry {
        charity_name: String,
        token_name: String,
        amount_donated: Balance,
        donor_address: AccountId,
        timestamp: Timestamp,
    }

    /// Errors that can occur in the contract
    #[derive(scale::Encode, scale::Decode)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
    pub enum Error {
        ModuleNotInitialized,
        AlreadyInitialized,
        CharityAlreadyExists,
        CharityNotFound,
        InvalidDonationAmount,
        CharityNotRegisteredForToken,
        NotModuleOwner,
        InsufficientBalance,
        TransferFailed,
    }

    /// Events emitted by the contract
    #[ink(event)]
    pub struct DonateEvent {
        #[ink(topic)]
        donor: AccountId,
        charity_name: String,
        token_name: String,
        amount: Balance,
        timestamp: Timestamp,
    }

    #[ink(event)]
    pub struct CharityRegisteredEvent {
        charity_name: String,
        charity_wallet: AccountId,
        #[ink(topic)]
        admin: AccountId,
    }

    /// Contract storage
    #[ink(storage)]
    pub struct EunoiaFoundation {
        /// Contract owner/admin
        owner: AccountId,
        /// Maps donor address to their donation history entries
        histories: Mapping<AccountId, Vec<HistoryEntry>>,
        /// Maps charity name to its wallet address
        charity_wallets: Mapping<String, AccountId>,
        /// Maps charity name to (maps token name to total amount raised for that token)
        charity_raised_amounts: Mapping<(String, String), Balance>,
    }

    impl EunoiaFoundation {
        /// Constructor to initialize the contract
        #[ink(constructor)]
        pub fn new() -> Self {
            Self {
                owner: Self::env().caller(),
                histories: Mapping::default(),
                charity_wallets: Mapping::default(),
                charity_raised_amounts: Mapping::default(),
            }
        }

        /// Register a new charity with the platform
        #[ink(message)]
        pub fn add_charity(&mut self, charity_name: String, charity_wallet: AccountId) -> Result<(), Error> {
            if self.env().caller() != self.owner {
                return Err(Error::NotModuleOwner);
            }
            if self.charity_wallets.get(&charity_name).is_some() {
                return Err(Error::CharityAlreadyExists);
            }

            self.charity_wallets.insert(&charity_name, &charity_wallet);

            self.env().emit_event(CharityRegisteredEvent {
                charity_name,
                charity_wallet,
                admin: self.env().caller(),
            });

            Ok(())
        }

        /// Donate native tokens to a charity
        #[ink(message, payable)]
        pub fn donate(&mut self, charity_name: String, token_name: String, amount: Balance) -> Result<(), Error> {
            // Validate token type (only "DOT" or "WND" supported)
            if token_name != "DOT" && token_name != "WND" {
                return Err(Error::CharityNotRegisteredForToken);
            }

            // Validate donation amount matches the transferred value
            if amount == 0 {
                return Err(Error::InvalidDonationAmount);
            }
            if amount != self.env().transferred_value() {
                return Err(Error::InvalidDonationAmount);
            }

            // Check if charity exists
            let charity_wallet = self.charity_wallets.get(&charity_name).ok_or(Error::CharityNotFound)?;

            // Transfer native tokens to the charity
            if self.env().transfer(charity_wallet, amount).is_err() {
                return Err(Error::TransferFailed);
            }

            // Update total raised amount for the charity and specific token type
            let key = (charity_name.clone(), token_name.clone());
            let current_amount = self.charity_raised_amounts.get(&key).unwrap_or(0);
            self.charity_raised_amounts.insert(&key, &(current_amount + amount));

            // Record the donation in history
            let donation_time = self.env().block_timestamp();
            let history_entry = HistoryEntry {
                charity_name: charity_name.clone(),
                token_name: token_name.clone(),
                amount_donated: amount,
                donor_address: self.env().caller(),
                timestamp: donation_time,
            };

            let mut donor_history = self.histories.get(&self.env().caller()).unwrap_or_default();
            donor_history.push(history_entry);
            self.histories.insert(&self.env().caller(), &donor_history);

            // Emit donation event
            self.env().emit_event(DonateEvent {
                donor: self.env().caller(),
                charity_name,
                token_name,
                amount,
                timestamp: donation_time,
            });

            Ok(())
        }

        /// Get the donation history for a given donor address
        #[ink(message)]
        pub fn get_donation_history(&self, donor_addr: AccountId) -> Vec<HistoryEntry> {
            self.histories.get(&donor_addr).unwrap_or_default()
        }

        /// Get the total amount raised by a specific charity for a specific token type
        #[ink(message)]
        pub fn get_charity_raised_amount(&self, charity_name: String, token_name: String) -> Balance {
            self.charity_raised_amounts.get(&(charity_name, token_name)).unwrap_or(0)
        }

        /// Get the wallet address for a given charity name
        #[ink(message)]
        pub fn get_charity_wallet(&self, charity_name: String) -> Result<AccountId, Error> {
            self.charity_wallets.get(&charity_name).ok_or(Error::CharityNotFound)
        }
    }

    #[cfg(test)]
    mod tests {
        use super::*;

        #[ink::test]
        fn test_new_contract() {
            let contract = EunoiaFoundation::new();
            assert_eq!(contract.owner, ink::env::test::default_accounts::<ink::env::DefaultEnvironment>().alice);
        }

        // #[ink::test]
        // fn test_add_charity() {
        //     let mut contract = EunoiaFoundation::new();
        //     let charity_name = String::from("TestCharity");
        //     let charity_wallet = ink::env::test::default_accounts::<ink::env::DefaultEnvironment>().bob;

        //     let result = contract.add_charity(charity_name.clone(), charity_wallet);
        //     assert!(result.is_ok());
        //     assert_eq!(contract.get_charity_wallet(charity_name).unwrap(), charity_wallet);
        // }

        // #[ink::test]
        // fn test_donate() {
        //     let mut contract = EunoiaFoundation::new();
        //     let charity_name = String::from("TestCharity");
        //     let token_name = String::from("DOT");
        //     let charity_wallet = ink::env::test::default_accounts::<ink::env::DefaultEnvironment>().bob;
        //     let amount = 1000;

        //     // Register charity
        //     contract.add_charity(charity_name.clone(), charity_wallet).unwrap();

        //     // Set up test environment for donation
        //     ink::env::test::set_caller::<ink::env::DefaultEnvironment>(ink::env::test::default_accounts::<ink::env::DefaultEnvironment>().alice);
        //     ink::env::test::set_value_transferred::<ink::env::DefaultEnvironment>(amount);

        //     let result = contract.donate(charity_name.clone(), token_name.clone(), amount);
        //     assert!(result.is_ok());

        //     // Verify donation history
        //     let history = contract.get_donation_history(ink::env::test::default_accounts::<ink::env::DefaultEnvironment>().alice);
        //     assert_eq!(history.len(), 1);
        //     assert_eq!(history[0].amount_donated, amount);
        //     assert_eq!(history[0].charity_name, charity_name);
        //     assert_eq!(history[0].token_name, token_name);

        //     // Verify raised amount
        //     assert_eq!(contract.get_charity_raised_amount(charity_name, token_name), amount);
        // }
    }
}