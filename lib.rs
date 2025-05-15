#![cfg_attr(not(feature = "std"), no_std, no_main)]
#![allow(clippy::cast_possible_truncation)]
#![allow(clippy::arithmetic_side_effects)]

use ink::prelude::vec::Vec;
use ink::prelude::string::String;
use ink::prelude::collections::BTreeMap;

#[ink::contract]
mod eunoia_new {
    use super::*;
    use ink::storage::Mapping;

    /// Represents a single donation event
    #[derive(Clone, Debug, PartialEq, Eq, scale::Encode, scale::Decode)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
    pub struct HistoryEntry {
        charity_name: String,
        coin_name: String,
        amount_donated: u128,
        donor_address: AccountId,
        timestamp: u64,
    }

    /// Emitted when a new donation is made
    #[ink(event)]
    pub struct DonateEvent {
        #[ink(topic)]
        donor: AccountId,
        charity_name: String,
        coin_name: String,
        amount: u128,
        timestamp: u64,
    }

    /// Emitted when a new charity is registered
    #[ink(event)]
    pub struct CharityRegisteredEvent {
        #[ink(topic)]
        charity_name: String,
        charity_wallet: AccountId,
        admin: AccountId,
    }

    /// Main contract storage
    #[ink(storage)]
    pub struct EunoiaNew {
        /// Contract owner
        owner: AccountId,
        /// Maps donor address to their donation history
        histories: Mapping<AccountId, Vec<HistoryEntry>>,
        /// Maps charity name to its wallet address
        charity_wallets: Mapping<String, AccountId>,
        /// Maps charity name to (maps coin type name to total amount raised)
        charity_raised_amounts: Mapping<String, BTreeMap<String, u128>>,
    }

    /// Error types
    #[derive(Debug, PartialEq, Eq, scale::Encode, scale::Decode)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
    pub enum Error {
        ModuleNotInitialized,
        CharityAlreadyExists,
        CharityNotFound,
        InvalidDonationAmount,
        NotModuleOwner,
        InsufficientBalance,
    }

    /// Type alias for the contract's result type
    pub type Result<T> = core::result::Result<T, Error>;

    impl Default for EunoiaNew {
        fn default() -> Self {
            Self::new()
        }
    }

    impl EunoiaNew {
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

        /// Register a new charity
        #[ink(message)]
        pub fn add_charity(&mut self, charity_name: String, charity_wallet: AccountId) -> Result<()> {
            self.ensure_caller_is_owner()?;

            // Check if charity already exists
            if self.charity_wallets.contains(&charity_name) {
                return Err(Error::CharityAlreadyExists);
            }

            // Register the charity
            self.charity_wallets.insert(&charity_name, &charity_wallet);
            
            // Initialize raised amounts for the charity
            let empty_map: BTreeMap<String, u128> = BTreeMap::new();
            self.charity_raised_amounts.insert(&charity_name, &empty_map);

            // Emit event
            self.env().emit_event(CharityRegisteredEvent {
                charity_name: charity_name.clone(),
                charity_wallet,
                admin: self.owner,
            });

            Ok(())
        }

        /// Donate native tokens to a charity
        #[ink(message, payable)]
        pub fn donate(&mut self, charity_name: String, coin_name: String) -> Result<()> {
            let donor = self.env().caller();
            let amount = self.env().transferred_value();
            let timestamp = self.env().block_timestamp();

            // Validation
            if amount == 0 {
                return Err(Error::InvalidDonationAmount);
            }

            if !self.charity_wallets.contains(&charity_name) {
                return Err(Error::CharityNotFound);
            }

            let charity_wallet = self.charity_wallets.get(&charity_name).unwrap();

            // Transfer the tokens to the charity wallet
            if self.env().transfer(charity_wallet, amount).is_err() {
                return Err(Error::InsufficientBalance);
            }

            // Update charity raised amounts
            let mut raised_amounts = self.charity_raised_amounts.get(&charity_name).unwrap_or_default();
            let current_amount = *raised_amounts.get(&coin_name).unwrap_or(&0);
            raised_amounts.insert(coin_name.clone(), current_amount + amount);
            self.charity_raised_amounts.insert(&charity_name, &raised_amounts);

            // Record donation history
            let history_entry = HistoryEntry {
                charity_name: charity_name.clone(),
                coin_name: coin_name.clone(),
                amount_donated: amount,
                donor_address: donor,
                timestamp,
            };

            let mut donor_history = self.histories.get(donor).unwrap_or_default();
            donor_history.push(history_entry);
            self.histories.insert(donor, &donor_history);

            // Emit event
            self.env().emit_event(DonateEvent {
                donor,
                charity_name,
                coin_name,
                amount,
                timestamp,
            });

            Ok(())
        }

        /// Get the donation history for a donor
        #[ink(message)]
        pub fn get_donation_history(&self, donor: AccountId) -> Vec<HistoryEntry> {
            self.histories.get(donor).unwrap_or_default()
        }

        /// Get the total amount raised by a charity for a specific coin
        #[ink(message)]
        pub fn get_charity_raised_amount(&self, charity_name: String, coin_name: String) -> u128 {
            if let Some(raised_amounts) = self.charity_raised_amounts.get(&charity_name) {
                *raised_amounts.get(&coin_name).unwrap_or(&0)
            } else {
                0
            }
        }

        /// Get the wallet address for a charity
        #[ink(message)]
        pub fn get_charity_wallet(&self, charity_name: String) -> Result<AccountId> {
            self.charity_wallets.get(&charity_name).ok_or(Error::CharityNotFound)
        }

        /// Get the contract owner
        #[ink(message)]
        pub fn owner(&self) -> AccountId {
            self.owner
        }

        /// Helper to check if caller is the contract owner
        fn ensure_caller_is_owner(&self) -> Result<()> {
            if self.env().caller() != self.owner {
                return Err(Error::NotModuleOwner);
            }
            Ok(())
        }
    }

    #[cfg(test)]
    mod tests {
        use super::*;
        use ink::env::{test, DefaultEnvironment};

        #[ink::test]
        fn initialization_works() {
            let contract = EunoiaNew::new();
            assert_eq!(contract.owner, test::default_accounts::<DefaultEnvironment>().alice);
        }

        #[ink::test]
        fn add_charity_works() {
            let mut contract = EunoiaNew::new();
            let charity_name = String::from("Test Charity");
            let charity_wallet = test::default_accounts::<DefaultEnvironment>().bob;
            
            assert!(contract.add_charity(charity_name.clone(), charity_wallet).is_ok());
            assert_eq!(contract.get_charity_wallet(charity_name).unwrap(), charity_wallet);
        }

        #[ink::test]
        fn donation_works() {
            // Setup
            let mut contract = EunoiaNew::new();
            let charity_name = String::from("Test Charity");
            let coin_name = String::from("DOT");
            let charity_wallet = test::default_accounts::<DefaultEnvironment>().bob;
            
            // Register charity
            assert!(contract.add_charity(charity_name.clone(), charity_wallet).is_ok());
            
            // Set contract balance to allow for donations
            test::set_account_balance::<DefaultEnvironment>(test::default_accounts::<DefaultEnvironment>().alice, 1000);
            test::set_value_transferred::<DefaultEnvironment>(100);
            
            // Make donation
            assert!(contract.donate(charity_name.clone(), coin_name.clone()).is_ok());
            
            // Check donation was recorded
            let donor = test::default_accounts::<DefaultEnvironment>().alice;
            let history = contract.get_donation_history(donor);
            assert_eq!(history.len(), 1);
            assert_eq!(history[0].charity_name, charity_name);
            assert_eq!(history[0].coin_name, coin_name);
            assert_eq!(history[0].amount_donated, 100);
            
            // Check raised amount was updated
            assert_eq!(contract.get_charity_raised_amount(charity_name, coin_name), 100);
        }
    }

    
} 