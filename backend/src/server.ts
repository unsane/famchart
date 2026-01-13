import express from 'express';
import cors from 'cors';
import { query, checkConnection } from './db';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Helper to convert DB rows to frontend shapes
const mapTask = (row: any, assignments: any[]) => ({
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
app.get('/api/state', async (req, res) => {
  try {
    const tasks = await query('SELECT * FROM tasks');
    const assignments = await query('SELECT * FROM task_assignments');
    const completedTasks = await query('SELECT * FROM completed_tasks');
    const pointRules = await query('SELECT * FROM point_rules');
    const rewards = await query('SELECT * FROM rewards');
    const vincentRows = await query('SELECT * FROM vincent_data WHERE id = 1');
    const bigGoalRows = await query('SELECT * FROM big_goals WHERE is_active = TRUE LIMIT 1');

    const state = {
      tasks: tasks.map((t: any) => mapTask(t, assignments)),
      completedTasks: completedTasks.map((ct: any) => ({
        id: ct.id,
        taskId: ct.task_id,
        completedBy: ct.completed_by,
        completedAt: ct.completed_at,
        pointsEarned: ct.points_earned
      })),
      pointRules: pointRules.map((pr: any) => ({
        id: pr.id,
        description: pr.description,
        points: pr.points,
        category: pr.category
      })),
      rewards: rewards.map((r: any) => ({
        id: r.id,
        title: r.title,
        description: r.description,
        pointsCost: r.points_cost,
        emoji: r.emoji
      })),
      vincentData: {
        bankPoints: vincentRows[0]?.bank_points || 0,
        lifetimePoints: vincentRows[0]?.lifetime_points || 0,
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
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch state' });
  }
});

// Tasks
app.post('/api/tasks', async (req, res) => {
  const task = req.body;
  try {
    await query(
      'INSERT INTO tasks (id, title, category, points, recurring, due_date, start_time, end_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [task.id, task.title, task.category, task.points, task.recurring, task.dueDate, task.startTime, task.endTime]
    );
    if (task.assignedTo && task.assignedTo.length > 0) {
      for (const member of task.assignedTo) {
        await query('INSERT INTO task_assignments (task_id, member_id) VALUES (?, ?)', [task.id, member]);
      }
    }
    res.status(201).json({ message: 'Task created' });
  } catch (error) {
    res.status(500).json({ error: error });
  }
});

app.put('/api/tasks/:id', async (req, res) => {
  const task = req.body;
  const { id } = req.params;
  try {
    await query(
      'UPDATE tasks SET title=?, category=?, points=?, recurring=?, due_date=?, start_time=?, end_time=? WHERE id=?',
      [task.title, task.category, task.points, task.recurring, task.dueDate, task.startTime, task.endTime, id]
    );
    
    // Update assignments: simple way is delete all and re-insert
    await query('DELETE FROM task_assignments WHERE task_id = ?', [id]);
    if (task.assignedTo && task.assignedTo.length > 0) {
        for (const member of task.assignedTo) {
          await query('INSERT INTO task_assignments (task_id, member_id) VALUES (?, ?)', [id, member]);
        }
    }
    res.json({ message: 'Task updated' });
  } catch (error) {
    res.status(500).json({ error: error });
  }
});

app.delete('/api/tasks/:id', async (req, res) => {
  try {
    await query('DELETE FROM tasks WHERE id = ?', [req.params.id]);
    res.json({ message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ error: error });
  }
});

// Completed Tasks
app.post('/api/completed-tasks', async (req, res) => {
  const ct = req.body;
  try {
    await query(
      'INSERT INTO completed_tasks (id, task_id, completed_by, completed_at, points_earned) VALUES (?, ?, ?, ?, ?)',
      [ct.id, ct.taskId, ct.completedBy, ct.completedAt, ct.pointsEarned]
    );

    // Update Vincent stats if applicable
    if (ct.completedBy === 'son') {
        await query('UPDATE vincent_data SET bank_points = bank_points + ?, lifetime_points = lifetime_points + ? WHERE id = 1', [ct.pointsEarned, ct.pointsEarned]);
    }

    res.status(201).json({ message: 'Task completed' });
  } catch (error) {
    res.status(500).json({ error: error });
  }
});

app.delete('/api/completed-tasks/:id', async (req, res) => {
    // This requires knowing the points and user to reverse the stats.
    // For simplicity, we expect the client to might handle the calculation or we fetch before delete.
    // Let's fetch first.
    try {
        const rows = await query('SELECT * FROM completed_tasks WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({error: 'Not found'});
        const ct = rows[0];

        await query('DELETE FROM completed_tasks WHERE id = ?', [req.params.id]);

        if (ct.completed_by === 'son') {
             await query('UPDATE vincent_data SET bank_points = bank_points - ?, lifetime_points = lifetime_points - ? WHERE id = 1', [ct.points_earned, ct.points_earned]);
             // Ensure not negative? DB constraints or logic here.
             await query('UPDATE vincent_data SET bank_points = GREATEST(0, bank_points), lifetime_points = GREATEST(0, lifetime_points) WHERE id = 1');
        }
        res.json({message: 'Uncompleted'});
    } catch (error) {
        res.status(500).json({ error: error });
    }
});

// Point Rules
app.post('/api/point-rules', async (req, res) => {
    const r = req.body;
    try {
        await query('INSERT INTO point_rules (id, description, points, category) VALUES (?, ?, ?, ?)', [r.id, r.description, r.points, r.category]);
        res.status(201).json({message: 'Rule added'});
    } catch(e) { res.status(500).json({error: e}) }
});

app.put('/api/point-rules/:id', async (req, res) => {
    const r = req.body;
    try {
        await query('UPDATE point_rules SET description=?, points=?, category=? WHERE id=?', [r.description, r.points, r.category, req.params.id]);
        res.json({message: 'Rule updated'});
    } catch(e) { res.status(500).json({error: e}) }
});

app.delete('/api/point-rules/:id', async (req, res) => {
    try {
        await query('DELETE FROM point_rules WHERE id=?', [req.params.id]);
        res.json({message: 'Rule deleted'});
    } catch(e) { res.status(500).json({error: e}) }
});

// Rewards
app.post('/api/rewards', async (req, res) => {
    const r = req.body;
    try {
        await query('INSERT INTO rewards (id, title, description, points_cost, emoji) VALUES (?, ?, ?, ?, ?)', [r.id, r.title, r.description, r.pointsCost, r.emoji]);
        res.status(201).json({message: 'Reward added'});
    } catch(e) { res.status(500).json({error: e}) }
});

app.put('/api/rewards/:id', async (req, res) => {
    const r = req.body;
    try {
        await query('UPDATE rewards SET title=?, description=?, points_cost=?, emoji=? WHERE id=?', [r.title, r.description, r.pointsCost, r.emoji, req.params.id]);
        res.json({message: 'Reward updated'});
    } catch(e) { res.status(500).json({error: e}) }
});

app.delete('/api/rewards/:id', async (req, res) => {
    try {
        await query('DELETE FROM rewards WHERE id=?', [req.params.id]);
        res.json({message: 'Reward deleted'});
    } catch(e) { res.status(500).json({error: e}) }
});

// Vincent Actions
app.post('/api/vincent/redeem', async (req, res) => {
    const { pointsCost } = req.body;
    try {
        await query('UPDATE vincent_data SET bank_points = bank_points - ? WHERE id = 1', [pointsCost]);
        res.json({message: 'Redeemed'});
    } catch(e) { res.status(500).json({error: e}) }
});

app.post('/api/vincent/transaction', async (req, res) => {
    const { amount, type } = req.body; // type: 'deposit' | 'withdraw' | 'adjust_lifetime'
    try {
        if (type === 'deposit') {
            await query('UPDATE vincent_data SET bank_points = bank_points + ? WHERE id = 1', [amount]);
        } else if (type === 'withdraw') {
             await query('UPDATE vincent_data SET bank_points = bank_points - ? WHERE id = 1', [amount]);
        } else if (type === 'adjust_lifetime') {
             await query('UPDATE vincent_data SET lifetime_points = lifetime_points + ? WHERE id = 1', [amount]);
        }
        res.json({message: 'Transaction complete'});
    } catch(e) { res.status(500).json({error: e}) }
});

app.post('/api/vincent/big-goal', async (req, res) => {
    const goal = req.body;
    try {
        if (goal === null) {
            await query('UPDATE big_goals SET is_active = FALSE');
        } else {
            await query('UPDATE big_goals SET is_active = FALSE'); // Deactivate old ones
            await query('INSERT INTO big_goals (id, title, description, target_points, emoji, is_active) VALUES (?, ?, ?, ?, ?, TRUE) ON DUPLICATE KEY UPDATE title=?, description=?, target_points=?, emoji=?, is_active=TRUE', 
                [goal.id, goal.title, goal.description, goal.targetPoints, goal.emoji, goal.title, goal.description, goal.targetPoints, goal.emoji]);
        }
        res.json({message: 'Big goal updated'});
    } catch(e) { res.status(500).json({error: e}) }
});

const startServer = async () => {
    let retries = 5;
    while (retries > 0) {
        if (await checkConnection()) {
            app.listen(PORT, () => {
                console.log(`Server running on port ${PORT}`);
            });
            return;
        }
        console.log(`Database not ready. Retrying in 5s... (${retries} attempts left)`);
        await new Promise(res => setTimeout(res, 5000));
        retries--;
    }
    console.error('Could not connect to database after multiple attempts. Exiting.');
    process.exit(1);
};

startServer();
