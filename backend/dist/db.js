"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.query = exports.checkConnection = void 0;
const mariadb_1 = __importDefault(require("mariadb"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const pool = mariadb_1.default.createPool({
    host: process.env.DB_HOST || 'mariadb',
    user: process.env.DB_USER || 'famchart',
    password: process.env.DB_PASSWORD || 'famchartpass',
    database: process.env.DB_NAME || 'famchart',
    connectionLimit: 5,
    acquireTimeout: 20000 // Increase timeout to 20s
});
const checkConnection = () => __awaiter(void 0, void 0, void 0, function* () {
    let conn;
    try {
        conn = yield pool.getConnection();
        console.log('Database connected successfully!');
        return true;
    }
    catch (err) {
        console.error('Database connection failed:', err);
        return false;
    }
    finally {
        if (conn)
            conn.release();
    }
});
exports.checkConnection = checkConnection;
const query = (sql, params) => __awaiter(void 0, void 0, void 0, function* () {
    let conn;
    try {
        conn = yield pool.getConnection();
        const res = yield conn.query(sql, params);
        return res;
    }
    catch (err) {
        console.error('Database Query Error:', err);
        throw err;
    }
    finally {
        if (conn)
            conn.release();
    }
});
exports.query = query;
