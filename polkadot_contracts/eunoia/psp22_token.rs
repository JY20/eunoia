#![cfg_attr(not(feature = "std"), no_std)]

#[ink::contract]
mod psp22_token {
    use ink::prelude::string::{String, ToString};
    use ink::storage::Mapping;

    /// Event emitted when a token transfer occurs
    #[ink(event)]
    pub struct Transfer {
        #[ink(topic)]
        from: Option<AccountId>,
        #[ink(topic)]
        to: Option<AccountId>,
        value: Balance,
    }

    /// Event emitted when an approval occurs
    #[ink(event)]
    pub struct Approval {
        #[ink(topic)]
        owner: AccountId,
        #[ink(topic)]
        spender: AccountId,
        value: Balance,
    }

    /// PSP22 error type
    #[derive(Debug, PartialEq, Eq, scale::Encode, scale::Decode)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
    pub enum Error {
        /// Insufficient balance for operation
        InsufficientBalance,
        /// Insufficient allowance for operation
        InsufficientAllowance,
        /// Operation is not permitted
        NotAllowed,
    }

    /// Main storage for the PSP22 token contract
    #[ink(storage)]
    pub struct Psp22Token {
        /// Total token supply
        total_supply: Balance,
        /// Mapping from owner to balance
        balances: Mapping<AccountId, Balance>,
        /// Mapping from owner to spender to allowance amount
        allowances: Mapping<(AccountId, AccountId), Balance>,
        /// Token name
        name: Option<String>,
        /// Token symbol
        symbol: Option<String>,
        /// Token decimals
        decimals: u8,
    }

    /// Type alias for result type
    pub type Result<T> = core::result::Result<T, Error>;

    impl Psp22Token {
        /// Creates a new PSP22 token contract with given total supply
        #[ink(constructor)]
        pub fn new(
            total_supply: Balance,
            name: Option<String>,
            symbol: Option<String>,
            decimals: u8,
        ) -> Self {
            let mut balances = Mapping::default();
            let caller = Self::env().caller();
            balances.insert(caller, &total_supply);
            
            Self::env().emit_event(Transfer {
                from: None,
                to: Some(caller),
                value: total_supply,
            });
            
            Self {
                total_supply,
                balances,
                allowances: Mapping::default(),
                name,
                symbol,
                decimals,
            }
        }

        /// Returns the token name
        #[ink(message)]
        pub fn name(&self) -> Option<String> {
            self.name.clone()
        }

        /// Returns the token symbol
        #[ink(message)]
        pub fn symbol(&self) -> Option<String> {
            self.symbol.clone()
        }

        /// Returns the token decimals
        #[ink(message)]
        pub fn decimals(&self) -> u8 {
            self.decimals
        }

        /// Returns the total token supply
        #[ink(message)]
        pub fn total_supply(&self) -> Balance {
            self.total_supply
        }

        /// Returns the account balance for the specified account
        #[ink(message)]
        pub fn balance_of(&self, owner: AccountId) -> Balance {
            self.balances.get(owner).unwrap_or_default()
        }

        /// Transfers `value` amount of tokens from the caller's account to `to`
        #[ink(message)]
        pub fn transfer(&mut self, to: AccountId, value: Balance) -> Result<()> {
            let from = self.env().caller();
            self.transfer_from_to(from, to, value)
        }

        /// Returns the amount of tokens that `spender` can spend on behalf of `owner` via
        /// `transfer_from`
        #[ink(message)]
        pub fn allowance(&self, owner: AccountId, spender: AccountId) -> Balance {
            self.allowances.get((owner, spender)).unwrap_or_default()
        }

        /// Approves `spender` to transfer up to `value` tokens on behalf of the caller
        #[ink(message)]
        pub fn approve(&mut self, spender: AccountId, value: Balance) -> Result<()> {
            let owner = self.env().caller();
            self.allowances.insert((owner, spender), &value);
            
            self.env().emit_event(Approval {
                owner,
                spender,
                value,
            });
            
            Ok(())
        }

        /// Transfers `value` tokens from `from` to `to` if the caller has sufficient allowance
        #[ink(message)]
        pub fn transfer_from(
            &mut self,
            from: AccountId,
            to: AccountId,
            value: Balance,
        ) -> Result<()> {
            let caller = self.env().caller();
            let allowance = self.allowance(from, caller);
            
            if allowance < value {
                return Err(Error::InsufficientAllowance);
            }
            
            self.transfer_from_to(from, to, value)?;
            
            // Decrease the allowance
            self.allowances.insert((from, caller), &(allowance - value));
            
            Ok(())
        }
        
        /// Internal function for transferring tokens
        fn transfer_from_to(
            &mut self,
            from: AccountId,
            to: AccountId,
            value: Balance,
        ) -> Result<()> {
            let from_balance = self.balance_of(from);
            
            if from_balance < value {
                return Err(Error::InsufficientBalance);
            }
            
            self.balances.insert(from, &(from_balance - value));
            let to_balance = self.balance_of(to);
            self.balances.insert(to, &(to_balance + value));
            
            self.env().emit_event(Transfer {
                from: Some(from),
                to: Some(to),
                value,
            });
            
            Ok(())
        }
    }

    #[cfg(test)]
    mod tests {
        use super::*;
        use ink::env::{test, DefaultEnvironment};

        /// Create a new token instance with default values
        fn create_token() -> Psp22Token {
            let name = Some(String::from("Eunoia Test Token"));
            let symbol = Some(String::from("ETT"));
            let decimals = 18;
            let initial_supply = 1_000_000;
            Psp22Token::new(initial_supply, name, symbol, decimals)
        }

        #[ink::test]
        fn constructor_works() {
            let token = create_token();
            let accounts = test::default_accounts::<DefaultEnvironment>();
            
            assert_eq!(token.name(), Some(String::from("Eunoia Test Token")));
            assert_eq!(token.symbol(), Some(String::from("ETT")));
            assert_eq!(token.decimals(), 18);
            assert_eq!(token.total_supply(), 1_000_000);
            assert_eq!(token.balance_of(accounts.alice), 1_000_000);
        }

        #[ink::test]
        fn transfer_works() {
            let mut token = create_token();
            let accounts = test::default_accounts::<DefaultEnvironment>();
            
            // Transfer from Alice to Bob
            assert_eq!(token.transfer(accounts.bob, 100), Ok(()));
            assert_eq!(token.balance_of(accounts.alice), 1_000_000 - 100);
            assert_eq!(token.balance_of(accounts.bob), 100);
        }

        #[ink::test]
        fn transfer_from_works() {
            let mut token = create_token();
            let accounts = test::default_accounts::<DefaultEnvironment>();
            
            // Alice approves Bob to spend 100 tokens
            assert_eq!(token.approve(accounts.bob, 100), Ok(()));
            
            // Switch to Bob as caller
            test::set_caller::<DefaultEnvironment>(accounts.bob);
            
            // Bob transfers 50 tokens from Alice to Charlie
            assert_eq!(token.transfer_from(accounts.alice, accounts.charlie, 50), Ok(()));
            
            // Check balances after transfer
            assert_eq!(token.balance_of(accounts.alice), 1_000_000 - 50);
            assert_eq!(token.balance_of(accounts.charlie), 50);
            
            // Check Bob's remaining allowance
            assert_eq!(token.allowance(accounts.alice, accounts.bob), 50);
        }

        #[ink::test]
        fn insufficient_balance_fails() {
            let mut token = create_token();
            let accounts = test::default_accounts::<DefaultEnvironment>();
            
            // Attempt to transfer more than Alice's balance
            assert_eq!(token.transfer(accounts.bob, 1_000_001), Err(Error::InsufficientBalance));
            
            // Balances should remain unchanged
            assert_eq!(token.balance_of(accounts.alice), 1_000_000);
            assert_eq!(token.balance_of(accounts.bob), 0);
        }
    }
} 