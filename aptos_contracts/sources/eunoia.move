/**
 * @title Eunoia Foundation Smart Contract
 * @dev This contract manages charitable donations on the Aptos blockchain.
 * @license MIT
 * @author Eunoia Team
 */
module eunoia::eunoia_foundation {

    use std::signer;
    use std::string::String;
    use std::vector;
    // use aptos_framework::type_name; // Removed as we will pass coin identifier string as argument

    use aptos_framework::event;
    use aptos_framework::table::{Self, Table};
    use aptos_framework::timestamp;
    use aptos_std::coin::{Self}; // Only 'Self' needed for coin functions like transfer, balance

    // --- Structs & Resources ---

    // Represents a single donation event
    struct HistoryEntry has store, drop, copy {
        charity_name: String,
        coin_name: String, // Name of the coin type donated
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
        // Maps charity name to (maps coin type name to total amount raised for that coin)
        charity_raised_amounts: Table<String, Table<String, u64>>,
    }

    // --- Events ---
    #[event]
    struct DonateEvent has drop, store {
        donor: address,
        charity_name: String,
        coin_name: String, // Name of the coin type donated
        amount: u64,
        timestamp: u64,
    }

    #[event]
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
    const E_CHARITY_NOT_REGISTERED_FOR_COIN: u64 = 302; // New error
    const E_NOT_MODULE_OWNER: u64 = 401;


    // --- Initialization ---
    /**
     * @notice Initializes the Eunoia contract
     * @param deployer The signer account that will own the contract
     * @dev Creates the ContractData resource and moves it to the deployer's account
     */
    public entry fun initialize_module(deployer: &signer) {
        let deployer_addr = signer::address_of(deployer);
        assert!(!exists<ContractData>(deployer_addr), E_ALREADY_INITIALIZED);

        move_to(deployer, ContractData {
            histories: table::new<address, vector<HistoryEntry>>(),
            charity_wallets: table::new<String, address>(),
            charity_raised_amounts: table::new<String, Table<String, u64>>(),
        });
    }

    // --- Charity Management Functions ---
    /**
     * @notice Registers a new charity in the system
     * @param module_owner The signer account that owns the module (authorization check)
     * @param charity_name The name of the charity to register
     * @param charity_wallet_addr The wallet address that will receive donations for this charity
     * @dev Only the module owner can register charities
     */
    public entry fun add_charity(
        module_owner: &signer,
        charity_name: String,
        charity_wallet_addr: address
    ) acquires ContractData {
        let module_owner_addr = signer::address_of(module_owner);
        assert_is_module_owner(module_owner_addr);

        let contract_data = borrow_global_mut<ContractData>(module_owner_addr);

        assert!(!table::contains(&contract_data.charity_wallets, charity_name), E_CHARITY_ALREADY_EXISTS);

        table::add(&mut contract_data.charity_wallets, charity_name, charity_wallet_addr);
        // Initialize raised amounts table for the new charity
        table::add(&mut contract_data.charity_raised_amounts, charity_name, table::new<String, u64>());

        event::emit(CharityRegisteredEvent {
            charity_name,
            charity_wallet: charity_wallet_addr,
            admin: module_owner_addr,
        });
    }

    // --- User Interaction Functions ---
    /**
     * @notice Allows a user to donate tokens to a registered charity
     * @param donor The signer account making the donation
     * @param charity_name The name of the charity to donate to
     * @param coin_identifier_string String identifier for the coin type being donated
     * @param amount The amount of tokens to donate
     * @dev Transfers tokens from donor to charity and records the donation
     */
    public entry fun donate<CoinType>(
        donor: &signer,
        charity_name: String,
        coin_identifier_string: String, // User provides the string identifier for CoinType
        amount: u64
    ) acquires ContractData {
        let donor_addr = signer::address_of(donor);
        let module_owner_addr = @eunoia; // Address where ContractData is stored
        let contract_data = borrow_global_mut<ContractData>(module_owner_addr);

        assert!(amount > 0, E_INVALID_DONATION_AMOUNT);
        assert!(coin::balance<CoinType>(donor_addr) >= amount, 131076);
        assert!(table::contains(&contract_data.charity_wallets, charity_name), E_CHARITY_NOT_FOUND);

        let charity_wallet_addr = *table::borrow(&contract_data.charity_wallets, charity_name);

        assert!(coin::is_account_registered<CoinType>(charity_wallet_addr), E_CHARITY_NOT_REGISTERED_FOR_COIN);

        coin::transfer<CoinType>(donor, charity_wallet_addr, amount);

        // Use the provided coin_identifier_string
        let coin_name_donated = coin_identifier_string;

        // Update total raised amount for the charity and specific coin type
        let per_charity_raised_table = table::borrow_mut(&mut contract_data.charity_raised_amounts, charity_name);
        let coin_specific_amount_ref = table::borrow_mut_with_default(per_charity_raised_table, coin_name_donated, 0u64);
        *coin_specific_amount_ref = *coin_specific_amount_ref + amount;

        // Record the donation in history
        let donation_time = timestamp::now_seconds();
        let history_entry = HistoryEntry {
            charity_name: charity_name,
            coin_name: coin_name_donated, // Storing the provided string
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
            coin_name: coin_name_donated, // Emitting the provided string
            amount,
            timestamp: donation_time,
        });
    }

    // --- View Functions (Publicly Readable) ---

    /**
     * @notice Retrieves the donation history for a specific donor
     * @param donor_addr The address of the donor
     * @return A vector of HistoryEntry objects containing donation details
     * @dev Returns an empty vector if the donor has no donation history
     */
    #[view]
    public fun get_donation_history(donor_addr: address): vector<HistoryEntry> acquires ContractData {
        let module_owner_addr = @eunoia;
        let contract_data = borrow_global<ContractData>(module_owner_addr);
        if (table::contains(&contract_data.histories, donor_addr)) {
            *table::borrow(&contract_data.histories, donor_addr)
        } else {
            vector::empty<HistoryEntry>()
        }
    }

    /**
     * @notice Gets the total amount raised by a specific charity for a specific coin type
     * @param charity_name The name of the charity
     * @param coin_name The name/identifier of the coin type
     * @return The total amount raised in the specified coin
     * @dev Returns 0 if the charity doesn't exist or has no donations of this coin type
     */
    #[view]
    public fun get_charity_raised_amount(charity_name: String, coin_name: String): u64 acquires ContractData {
        let module_owner_addr = @eunoia;
        let contract_data = borrow_global<ContractData>(module_owner_addr);
        if (table::contains(&contract_data.charity_raised_amounts, charity_name)) {
            let per_charity_table = table::borrow(&contract_data.charity_raised_amounts, charity_name);
            if (table::contains(per_charity_table, coin_name)) {
                *table::borrow(per_charity_table, coin_name)
            } else {
                0u64 // No donations of this coin type for this charity
            }
        } else {
            0u64 // Charity not found or has no donations
        }
    }

    /**
     * @notice Gets the wallet address for a given charity name
     * @param charity_name The name of the charity
     * @return The wallet address associated with the charity
     * @dev Reverts if the charity does not exist
     */
    #[view]
    public fun get_charity_wallet(charity_name: String): address acquires ContractData {
        let module_owner_addr = @eunoia;
        let contract_data = borrow_global<ContractData>(module_owner_addr);
        assert!(table::contains(&contract_data.charity_wallets, charity_name), E_CHARITY_NOT_FOUND);
        *table::borrow(&contract_data.charity_wallets, charity_name)
    }

    // --- Internal Helper Functions ---
    fun assert_is_module_owner(addr: address) {
        assert!(exists<ContractData>(addr), E_NOT_MODULE_OWNER);
    }
} 