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
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const db_1 = require("./db");
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
const PORT = process.env.PORT || 3000;
// Helper to convert DB rows to frontend shapes
const mapTask = (row, assignments) => ({
    id: row.id,
    title: row.title,
    category: row.category,
    points: row.points,
    recurring: row.recurring,
    dueDate: row.due_date,
    startTime: row.start_time,
    endTime: row.end_time,
    assignedTo: assignments.filter(a => a.task_id === row.id).map(a => a.member_id)
});
// --- Routes ---
// Get full initial state
app.get('/api/state', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const tasks = yield (0, db_1.query)('SELECT * FROM tasks');
        const assignments = yield (0, db_1.query)('SELECT * FROM task_assignments');
        const completedTasks = yield (0, db_1.query)('SELECT * FROM completed_tasks');
        const pointRules = yield (0, db_1.query)('SELECT * FROM point_rules');
        const rewards = yield (0, db_1.query)('SELECT * FROM rewards');
        const vincentRows = yield (0, db_1.query)('SELECT * FROM vincent_data WHERE id = 1');
        const bigGoalRows = yield (0, db_1.query)('SELECT * FROM big_goals WHERE is_active = TRUE LIMIT 1');
        const state = {
            tasks: tasks.map((t) => mapTask(t, assignments)),
            completedTasks: completedTasks.map((ct) => ({
                id: ct.id,
                taskId: ct.task_id,
                completedBy: ct.completed_by,
                completedAt: ct.completed_at,
                pointsEarned: ct.points_earned
            })),
            pointRules: pointRules.map((pr) => ({
                id: pr.id,
                description: pr.description,
                points: pr.points,
                category: pr.category
            })),
            rewards: rewards.map((r) => ({
                id: r.id,
                title: r.title,
                description: r.description,
                pointsCost: r.points_cost,
                emoji: r.emoji
            })),
            vincentData: {
                bankPoints: ((_a = vincentRows[0]) === null || _a === void 0 ? void 0 : _a.bank_points) || 0,
                lifetimePoints: ((_b = vincentRows[0]) === null || _b === void 0 ? void 0 : _b.lifetime_points) || 0,
                bigGoal: bigGoalRows[0] ? {
                    id: bigGoalRows[0].id,
                    title: bigGoalRows[0].title,
                    description: bigGoalRows[0].description,
                    targetPoints: bigGoalRows[0].target_points,
                    emoji: bigGoalRows[0].emoji
                } : null
            },
            currentUser: null // Handled by frontend
        };
        res.json(state);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch state' });
    }
}));
// Tasks
app.post('/api/tasks', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const task = req.body;
    try {
        yield (0, db_1.query)('INSERT INTO tasks (id, title, category, points, recurring, due_date, start_time, end_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [task.id, task.title, task.category, task.points, task.recurring, task.dueDate, task.startTime, task.endTime]);
        if (task.assignedTo && task.assignedTo.length > 0) {
            for (const member of task.assignedTo) {
                yield (0, db_1.query)('INSERT INTO task_assignments (task_id, member_id) VALUES (?, ?)', [task.id, member]);
            }
        }
        res.status(201).json({ message: 'Task created' });
    }
    catch (error) {
        res.status(500).json({ error: error });
    }
}));
app.put('/api/tasks/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const task = req.body;
    const { id } = req.params;
    try {
        yield (0, db_1.query)('UPDATE tasks SET title=?, category=?, points=?, recurring=?, due_date=?, start_time=?, end_time=? WHERE id=?', [task.title, task.category, task.points, task.recurring, task.dueDate, task.startTime, task.endTime, id]);
        // Update assignments: simple way is delete all and re-insert
        yield (0, db_1.query)('DELETE FROM task_assignments WHERE task_id = ?', [id]);
        if (task.assignedTo && task.assignedTo.length > 0) {
            for (const member of task.assignedTo) {
                yield (0, db_1.query)('INSERT INTO task_assignments (task_id, member_id) VALUES (?, ?)', [id, member]);
            }
        }
        res.json({ message: 'Task updated' });
    }
    catch (error) {
        res.status(500).json({ error: error });
    }
}));
app.delete('/api/tasks/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, db_1.query)('DELETE FROM tasks WHERE id = ?', [req.params.id]);
        res.json({ message: 'Task deleted' });
    }
    catch (error) {
        res.status(500).json({ error: error });
    }
}));
// Completed Tasks
app.post('/api/completed-tasks', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const ct = req.body;
    try {
        yield (0, db_1.query)('INSERT INTO completed_tasks (id, task_id, completed_by, completed_at, points_earned) VALUES (?, ?, ?, ?, ?)', [ct.id, ct.taskId, ct.completedBy, ct.completedAt, ct.pointsEarned]);
        // Update Vincent stats if applicable
        if (ct.completedBy === 'son') {
            yield (0, db_1.query)('UPDATE vincent_data SET bank_points = bank_points + ?, lifetime_points = lifetime_points + ? WHERE id = 1', [ct.pointsEarned, ct.pointsEarned]);
        }
        res.status(201).json({ message: 'Task completed' });
    }
    catch (error) {
        res.status(500).json({ error: error });
    }
}));
app.delete('/api/completed-tasks/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // This requires knowing the points and user to reverse the stats.
    // For simplicity, we expect the client to might handle the calculation or we fetch before delete.
    // Let's fetch first.
    try {
        const rows = yield (0, db_1.query)('SELECT * FROM completed_tasks WHERE id = ?', [req.params.id]);
        if (rows.length === 0)
            return res.status(404).json({ error: 'Not found' });
        const ct = rows[0];
        yield (0, db_1.query)('DELETE FROM completed_tasks WHERE id = ?', [req.params.id]);
        if (ct.completed_by === 'son') {
            yield (0, db_1.query)('UPDATE vincent_data SET bank_points = bank_points - ?, lifetime_points = lifetime_points - ? WHERE id = 1', [ct.points_earned, ct.points_earned]);
            // Ensure not negative? DB constraints or logic here.
            yield (0, db_1.query)('UPDATE vincent_data SET bank_points = GREATEST(0, bank_points), lifetime_points = GREATEST(0, lifetime_points) WHERE id = 1');
        }
        res.json({ message: 'Uncompleted' });
    }
    catch (error) {
        res.status(500).json({ error: error });
    }
}));
// Point Rules
app.post('/api/point-rules', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const r = req.body;
    try {
        yield (0, db_1.query)('INSERT INTO point_rules (id, description, points, category) VALUES (?, ?, ?, ?)', [r.id, r.description, r.points, r.category]);
        res.status(201).json({ message: 'Rule added' });
    }
    catch (e) {
        res.status(500).json({ error: e });
    }
}));
app.put('/api/point-rules/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const r = req.body;
    try {
        yield (0, db_1.query)('UPDATE point_rules SET description=?, points=?, category=? WHERE id=?', [r.description, r.points, r.category, req.params.id]);
        res.json({ message: 'Rule updated' });
    }
    catch (e) {
        res.status(500).json({ error: e });
    }
}));
app.delete('/api/point-rules/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, db_1.query)('DELETE FROM point_rules WHERE id=?', [req.params.id]);
        res.json({ message: 'Rule deleted' });
    }
    catch (e) {
        res.status(500).json({ error: e });
    }
}));
// Rewards
app.post('/api/rewards', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const r = req.body;
    try {
        yield (0, db_1.query)('INSERT INTO rewards (id, title, description, points_cost, emoji) VALUES (?, ?, ?, ?, ?)', [r.id, r.title, r.description, r.pointsCost, r.emoji]);
        res.status(201).json({ message: 'Reward added' });
    }
    catch (e) {
        res.status(500).json({ error: e });
    }
}));
app.put('/api/rewards/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const r = req.body;
    try {
        yield (0, db_1.query)('UPDATE rewards SET title=?, description=?, points_cost=?, emoji=? WHERE id=?', [r.title, r.description, r.pointsCost, r.emoji, req.params.id]);
        res.json({ message: 'Reward updated' });
    }
    catch (e) {
        res.status(500).json({ error: e });
    }
}));
app.delete('/api/rewards/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, db_1.query)('DELETE FROM rewards WHERE id=?', [req.params.id]);
        res.json({ message: 'Reward deleted' });
    }
    catch (e) {
        res.status(500).json({ error: e });
    }
}));
// Vincent Actions
app.post('/api/vincent/redeem', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { pointsCost } = req.body;
    try {
        yield (0, db_1.query)('UPDATE vincent_data SET bank_points = bank_points - ? WHERE id = 1', [pointsCost]);
        res.json({ message: 'Redeemed' });
    }
    catch (e) {
        res.status(500).json({ error: e });
    }
}));
app.post('/api/vincent/transaction', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { amount, type } = req.body; // type: 'deposit' | 'withdraw' | 'adjust_lifetime'
    try {
        if (type === 'deposit') {
            yield (0, db_1.query)('UPDATE vincent_data SET bank_points = bank_points + ? WHERE id = 1', [amount]);
        }
        else if (type === 'withdraw') {
            yield (0, db_1.query)('UPDATE vincent_data SET bank_points = bank_points - ? WHERE id = 1', [amount]);
        }
        else if (type === 'adjust_lifetime') {
            yield (0, db_1.query)('UPDATE vincent_data SET lifetime_points = lifetime_points + ? WHERE id = 1', [amount]);
        }
        res.json({ message: 'Transaction complete' });
    }
    catch (e) {
        res.status(500).json({ error: e });
    }
}));
app.post('/api/vincent/big-goal', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const goal = req.body;
    try {
        if (goal === null) {
            yield (0, db_1.query)('UPDATE big_goals SET is_active = FALSE');
        }
        else {
            yield (0, db_1.query)('UPDATE big_goals SET is_active = FALSE'); // Deactivate old ones
            yield (0, db_1.query)('INSERT INTO big_goals (id, title, description, target_points, emoji, is_active) VALUES (?, ?, ?, ?, ?, TRUE) ON DUPLICATE KEY UPDATE title=?, description=?, target_points=?, emoji=?, is_active=TRUE', [goal.id, goal.title, goal.description, goal.targetPoints, goal.emoji, goal.title, goal.description, goal.targetPoints, goal.emoji]);
        }
        res.json({ message: 'Big goal updated' });
    }
    catch (e) {
        res.status(500).json({ error: e });
    }
}));
const startServer = () => __awaiter(void 0, void 0, void 0, function* () {
    let retries = 5;
    while (retries > 0) {
        if (yield (0, db_1.checkConnection)()) {
            app.listen(PORT, () => {
                console.log(`Server running on port ${PORT}`);
            });
            return;
        }
        console.log(`Database not ready. Retrying in 5s... (${retries} attempts left)`);
        yield new Promise(res => setTimeout(res, 5000));
        retries--;
    }
    console.error('Could not connect to database after multiple attempts. Exiting.');
    process.exit(1);
});
startServer();
