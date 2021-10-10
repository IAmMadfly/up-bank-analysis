import Database from 'better-sqlite3';
import { ThemeConsumer } from 'styled-components';
import { ListAccountResponse } from 'up-bank-api';
import { ListCategoriesRequest } from 'up-bank-api';
import { CategoryResource, ListTransactionsResponse, PaginationLinks, UpApi } from 'up-bank-api'

let userPrep = 
`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    name STRING NOT NULL,
    token STRING NOT NULL
)`;
let accountsPrep = 
`CREATE TABLE IF NOT EXISTS accounts (
    id TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    deleted INTEGER DEFAULT 0,
    type TEXT,
    balance REAL,
    created INTEGER,
    link TEXT,
    FOREIGN KEY(user_id) REFERENCES users(id)
)`;
let categoriesPrep = 
`CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    name TEXT,
    parent_id TEXT,
    link TEXT,
    FOREIGN KEY(parent_id) REFERENCES categories(id)
)`;
let tagsPrep =
`CREATE TABLE IF NOT EXISTS tags (
    id TEXT PRIMARY KEY,
    transactions_link TEXT
)`;
let transactionsPrep =
`CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    account_id TEXT,
    description TEXT,
    message TEXT,
    amount REAL,
    created INTEGER,
    settled INTEGER,
    category_id TEXT,
    link TEXT,
    FOREIGN KEY(account_id) REFERENCES accounts(id),
    FOREIGN KEY(category_id) REFERENCES categories(id)
)`;

export default class DatabaseHandler {
    db: Database.Database;

    constructor(file: string = "data.db") {
        // Configure database first
        this.db = new Database(file);

        this.db.prepare('PRAGMA foreign_keys = ON;').run();
        let foreign_keys = this.db
            .prepare('PRAGMA foreign_keys;').get();

        if (foreign_keys.foreign_keys === 1) {
            console.log("Database ready! 🎉");
        } else {
            throw Error("Failed to prepare database");
        }

        this.db.prepare(userPrep).run();
        this.db.prepare(accountsPrep).run();
        this.db.prepare(categoriesPrep).run();
        this.db.prepare(tagsPrep).run();
        this.db.prepare(transactionsPrep).run();
    }

    add_user(name: string, token: string) {
        this.db.prepare("INSERT INTO users (name, token) VALUES (?, ?)")
            .run(name, token);
    }

    remove_user(user_id: string) {
        this.db.prepare("DELETE FROM users WHERE id = ?")
            .run(user_id);
    }

    get_users(): {id: string, name: string}[] {
        return this.db.prepare("SELECT id, name FROM users").all();
    }

    get_user_handler(id: number): UserHandler {
        return new UserHandler(this, id);
    }
}

class UserHandler {
    userId:     number
    handler:    DatabaseHandler
    api:        UpApi

    constructor(handler: DatabaseHandler, userId: number) {
        this.handler = handler;
        this.userId = userId;

        this.api = new UpApi(this.get_token());

        this.api.util.ping().then((res: any) => {
            if (res.meta.statusEmoji !== '⚡️') {
                console.log("API unaccessable 😭");
                throw Error("Up Bank API inaccessable");
            } else {
                this.update_accounts();
                this.update_categories().then(() => {
                    this.update_transactions();
                });
            }
        });
    }

    get_token(): string {
        let token = this.handler.db
            .prepare("SELECT token FROM users WHERE id = ?")
            .get(this.userId)
            .token;
        
        if (typeof token !== 'string') {
            throw Error("Failed to get token for user");
        }

        return token;
    }

    async update_loop<DataType extends {links: PaginationLinks<DataType>}>(
        loop_element: DataType,
        data_callback: (data: DataType) => void
    ) {
        data_callback(loop_element);
        if (loop_element.links.next) {

        }
        loop_element.links.next?.().then((res: DataType) => {
            this.update_loop(res, data_callback);
        });
    }

    async update_accounts(): Promise<void> {
        console.log("UPDATING ACCOUNT");
        this.api.accounts.list().then((res: ListAccountResponse) => {
            for (let account of res.data) {
                this.handler.db.prepare(`
                    INSERT OR IGNORE INTO accounts 
                    (id, name, type, balance, created, link)
                    VALUES(?, ?, ?, ?, ?, ?)
                `).run(
                    account.id,
                    account.attributes.displayName,
                    account.attributes.accountType.toString(),
                    parseFloat(account.attributes.balance.value),
                    (new Date(account.attributes.createdAt)).getTime(),
                    account.links.self
                );
            }

            return;
        });
    }

    async update_categories(): Promise<void> {
        let self = this;
        this.api.categories.list().then((res: { data: CategoryResource[] }) => {
            let child_cats: Array<CategoryResource> = new Array();

            function insert_cat (cat: CategoryResource) {
                self.handler.db.prepare(`INSERT OR IGNORE INTO categories(id, name, parent_id, link) 
                    VALUES (?, ?, ?, ?)`)
                    .run(
                        cat.id,
                        cat.attributes.name,
                        cat.relationships.parent.data?.id,
                        cat.links.self
                    );
            }

            for (let category of res.data) {
                if (category.relationships.parent.data) {
                    child_cats.push(category);
                } else {
                    insert_cat(category);
                }
            }
            for (let category of child_cats) {
                insert_cat(category);
            }
            return;
        });
    }

    async update_transactions(): Promise<void> {
        console.log("UPDATING TRANSACTIONS");
        let page = 1;
        let self = this;
        function update_database(transactions: ListTransactionsResponse) {
            console.log("Updating transactions, page:", page++);

            for (let transaction of transactions.data) {
                try {
                    self.handler.db.prepare(`INSERT OR IGNORE INTO transactions (
                        id, account_id, description, message, amount, created, settled, category_id, link
                    ) VALUES (?,?,?,?,?,?,?,?,?)`
                    ).run(
                        transaction.id,
                        transaction.relationships.account.data.id,
                        transaction.attributes.description,
                        transaction.attributes.message,
                        parseFloat(transaction.attributes.amount.value),
                        (new Date(transaction.attributes.createdAt)).getTime(),
                        (new Date(transaction.attributes.settledAt)).getTime(),
                        transaction.relationships.category.data?.id,
                        transaction.links.self
                    );
                } catch (err) {
                    console.log(
                        "Failed to add to SQLite database with error:",
                        err,
                        "and data:",
                        JSON.stringify(transaction)
                    );
                }
            }
        }

        this.api.transactions.list().then((res: ListTransactionsResponse) => {
            this.update_loop(res, update_database);
        })
    }
}

