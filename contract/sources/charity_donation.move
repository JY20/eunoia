module 0x1::charity_donation { // TODO: Replace 0x1 with your deployment account address

    use std::signer;
    use std::string::{Self, String};
    use std::vector;

    use aptos_framework::account;
    use aptos_framework::event;
    use aptos_framework::table::{Self, Table};
    use aptos_framework::timestamp;
    use aptos_std::coin::{Self, Coin, MintCapability, BurnCapability, FreezeCapability};
    use aptos_std::managed_coin;

    // --- Coin Definition (CharityCoin) ---
    struct CharityCoin has store, copy, drop {}

    // --- Structs & Resources ---

    // Represents a single donation event
    struct HistoryEntry has store, drop, copy {
        charity_name: String,
        amount_donated: u64,
        donor_address: address,
        timestamp: u64,
    }

    // Resource to store all contract-wide data, held by the module owner's account
    struct ContractData has key {
        // Maps donor address to a vector of their donation history entries
        histories: Table<address, vector<HistoryEntry>>,
        // Maps charity name (as String ID) to its wallet address
        charity_wallets: Table<String, address>,
        // Maps charity name (as String ID) to the total amount of CharityCoin raised
        charity_raised_amounts: Table<String, u64>,
        // Capabilities for managing CharityCoin
        mint_cap: MintCapability<CharityCoin>,
        burn_cap: BurnCapability<CharityCoin>,
        freeze_cap: FreezeCapability<CharityCoin>,
    }

    // --- Events ---
    struct DonateEvent has drop, store {
        donor: address,
        charity_name: String,
        amount: u64,
        timestamp: u64,
    }

    struct CharityRegisteredEvent has drop, store {
        charity_name: String,
        charity_wallet: address,
        admin: address,
    }

    // --- Errors ---
    const E_MODULE_NOT_INITIALIZED: u64 = 101;
    const E_ALREADY_INITIALIZED: u64 = 102;
    const E_CHARITY_ALREADY_EXISTS: u64 = 201;
    const E_CHARITY_NOT_FOUND: u64 = 202;
    const E_INVALID_DONATION_AMOUNT: u64 = 301;
    const E_NOT_MODULE_OWNER: u64 = 401;

    // --- Initialization ---

    // Initializes the CharityCoin and the ContractData resource.
    // Must be called by the account deploying this module.
    public entry fun initialize_module(deployer: &signer) {
        let deployer_addr = signer::address_of(deployer);
        assert!(!exists<ContractData>(deployer_addr), E_ALREADY_INITIALIZED);

        let (burn_cap, freeze_cap, mint_cap) = managed_coin::initialize<CharityCoin>(
            deployer,
            b"Charity Coin", // Name
            b"CHC",         // Symbol
            6,              // Decimals
            false           // monitor_supply - set to false for simplicity
        );

        move_to(deployer, ContractData {
            histories: table::new<address, vector<HistoryEntry>>(),
            charity_wallets: table::new<String, address>(),
            charity_raised_amounts: table::new<String, u64>(),
            mint_cap,
            burn_cap,
            freeze_cap,
        });
    }

    // --- CharityCoin Specific Functions ---

    // Allows users to register to hold CharityCoin.
    public entry fun register_charity_coin(account: &signer) {
        managed_coin::register<CharityCoin>(account);
    }

    // Allows the module owner to mint CharityCoin.
    public entry fun mint_charity_coin(
        module_owner: &signer,
        recipient_addr: address,
        amount: u64
    ) acquires ContractData {
        let module_owner_addr = signer::address_of(module_owner);
        assert_is_module_owner(module_owner_addr);
        let contract_data = borrow_global<ContractData>(module_owner_addr);
        let coin_minted = coin::mint<CharityCoin>(amount, &contract_data.mint_cap);
        coin::deposit(recipient_addr, coin_minted);
    }

    // --- Charity Management Functions ---

    // Registers a new charity. Only the module owner can call this.
    public entry fun add_charity(
        module_owner: &signer,
        charity_name: String,
        charity_wallet_addr: address
    ) acquires ContractData {
        let module_owner_addr = signer::address_of(module_owner);
        assert_is_module_owner(module_owner_addr);

        let contract_data = borrow_global_mut<ContractData>(module_owner_addr);

        assert!(!table::contains(&contract_data.charity_wallets, charity_name), E_CHARITY_ALREADY_EXISTS);

        // Ensure the charity wallet is registered for CharityCoin if we want to transfer to it directly
        // For simplicity, we assume the charity wallet will register separately.
        // Or, the charity could be an account that can self-register.

        table::add(&mut contract_data.charity_wallets, charity_name, charity_wallet_addr);
        // Initialize raised amount to 0 for the new charity
        table::add(&mut contract_data.charity_raised_amounts, string::utf8(string::bytes(&charity_name)), 0u64);


        event::emit(CharityRegisteredEvent {
            charity_name,
            charity_wallet: charity_wallet_addr,
            admin: module_owner_addr,
        });
    }

    // --- User Interaction Functions ---

    // Allows a user to donate CharityCoin to a registered charity.
    public entry fun donate(
        donor: &signer,
        charity_name: String,
        amount: u64
    ) acquires ContractData {
        let donor_addr = signer::address_of(donor);
        let module_owner_addr = an_address_that_deployed_the_module(); // Helper to get deployer address
        let contract_data = borrow_global_mut<ContractData>(module_owner_addr);

        assert!(amount > 0, E_INVALID_DONATION_AMOUNT);
        assert!(coin::balance<CharityCoin>(donor_addr) >= amount, coin::E_INSUFFICIENT_BALANCE);
        assert!(table::contains(&contract_data.charity_wallets, charity_name), E_CHARITY_NOT_FOUND);

        let charity_wallet_addr = *table::borrow(&contract_data.charity_wallets, charity_name);

        // Transfer CharityCoin from donor to charity
        coin::transfer<CharityCoin>(donor, charity_wallet_addr, amount);

        // Update total raised amount for the charity
        let current_raised = table::borrow_mut(&mut contract_data.charity_raised_amounts, string::utf8(string::bytes(&charity_name)));
        *current_raised = *current_raised + amount;

        // Record the donation in history
        let donation_time = timestamp::now_seconds();
        let history_entry = HistoryEntry {
            charity_name: charity_name,
            amount_donated: amount,
            donor_address: donor_addr,
            timestamp: donation_time,
        };

        if (!table::contains(&contract_data.histories, donor_addr)) {
            table::add(&mut contract_data.histories, donor_addr, vector::empty<HistoryEntry>());
        };
        let user_history = table::borrow_mut(&mut contract_data.histories, donor_addr);
        vector::push_back(user_history, history_entry);

        event::emit(DonateEvent {
            donor: donor_addr,
            charity_name,
            amount,
            timestamp: donation_time,
        });
    }

    // --- View Functions (Publicly Readable) ---

    // Gets the CharityCoin balance for a given account address.
    #[view]
    public fun get_charity_coin_balance(account_addr: address): u64 {
        // Ensure user is registered for the coin, otherwise balance is 0 or call would fail.
        // coin::balance handles non-existence of CoinStore gracefully by returning 0 if allow_ungated_balance_query() is true for coin,
        // or if aptos_std::coin is used with a version that supports it or if the account has a CoinStore.
        // For managed_coin, it's generally safe.
        if (coin::is_account_registered<CharityCoin>(account_addr)) {
            coin::balance<CharityCoin>(account_addr)
        } else {
            0u64
        }
    }

    // Gets the donation history for a given donor address.
    #[view]
    public fun get_donation_history(donor_addr: address): vector<HistoryEntry> acquires ContractData {
        let module_owner_addr = an_address_that_deployed_the_module();
        let contract_data = borrow_global<ContractData>(module_owner_addr);
        if (table::contains(&contract_data.histories, donor_addr)) {
            *table::borrow(&contract_data.histories, donor_addr)
        } else {
            vector::empty<HistoryEntry>()
        }
    }

    // Gets the total amount of CharityCoin raised by a specific charity.
    #[view]
    public fun get_charity_raised_amount(charity_name: String): u64 acquires ContractData {
        let module_owner_addr = an_address_that_deployed_the_module();
        let contract_data = borrow_global<ContractData>(module_owner_addr);
        if (table::contains(&contract_data.charity_raised_amounts, charity_name)) {
            *table::borrow(&contract_data.charity_raised_amounts, charity_name)
        } else {
            // Or return an error/option type if preferred for "not found"
            0u64
        }
    }

    #[view]
    public fun get_charity_wallet(charity_name: String): address acquires ContractData {
        let module_owner_addr = an_address_that_deployed_the_module();
        let contract_data = borrow_global<ContractData>(module_owner_addr);
        assert!(table::contains(&contract_data.charity_wallets, charity_name), E_CHARITY_NOT_FOUND);
        *table::borrow(&contract_data.charity_wallets, charity_name)
    }


    // --- Internal Helper Functions ---
    // Placeholder for a function or constant that returns the module owner's address.
    // In a real deployment, this would be the address that deployed the module.
    // For testing, this could be hardcoded or passed around.
    // For module design, the ContractData resource is stored under the deployer's address.
    fun an_address_that_deployed_the_module(): address {
        @0x1 // TODO: This MUST be the address that deployed and initialized the module.
              // You should make this a const or an immutable global.
              // Or, better, ensure ContractData is always fetched from signer::address_of(module_owner)
              // For view functions, this requires passing the owner address or having it stored globally.
              // For simplicity in view functions that cannot take a signer, we use this placeholder.
              // A better pattern is to have view functions on resources stored on known accounts or using global state.
    }

    // Asserts that the signer is the module owner.
    // This requires ContractData to be initialized.
    fun assert_is_module_owner(addr: address) {
        // This check implies that ContractData must exist at `addr`,
        // which also implies initialize_module was called by `addr`.
        assert!(exists<ContractData>(addr), E_NOT_MODULE_OWNER);
        // More robustly, you might store the owner address in ContractData itself upon init.
        // For now, existence of ContractData at `addr` implies `addr` is owner.
    }

    // TODO: Add burn function for CharityCoin if needed, using burn_cap from ContractData.
    // public entry fun burn_charity_coin(user: &signer, amount: u64) acquires ContractData { ... }

    // TODO: Add freeze/unfreeze account functions if needed, using freeze_cap.
} 