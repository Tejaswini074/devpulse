const GithubRepository = require("./github.repository");
const db = require("../../config/db");
const { toISODate } = require("../../utils/dateRange");

class GithubService {

    async setUsername(userId, githubUsername) {
        await db.execute(
            "UPDATE users SET github_username = ? WHERE id = ?",
            [githubUsername, userId]
        );
        return true;
    }

    async fetchPublicEvents(username) {
        const response = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}/events/public`, {
            headers: { "User-Agent": "DevPulse-App" }
        });

        if (response.status === 404) {
            throw new Error("GitHub user not found");
        }
        if (!response.ok) {
            throw new Error("Failed to fetch GitHub activity (rate limited or unavailable)");
        }

        return response.json();
    }

    aggregateEventsByDay(events) {
        const byDate = {};

        for (const event of events) {
            const date = toISODate(new Date(event.created_at));
            if (!byDate[date]) {
                byDate[date] = { commit_count: 0, pull_requests: 0, issues_closed: 0 };
            }

            if (event.type === "PushEvent") {
                byDate[date].commit_count += event.payload?.commits?.length ?? event.payload?.size ?? 0;
            } else if (event.type === "PullRequestEvent" && event.payload?.action === "opened") {
                byDate[date].pull_requests += 1;
            } else if (event.type === "IssuesEvent" && event.payload?.action === "closed") {
                byDate[date].issues_closed += 1;
            }
        }

        return byDate;
    }

    async syncUser(user) {
        if (!user.github_username) {
            return { synced: false, reason: "No GitHub username set" };
        }

        const events = await this.fetchPublicEvents(user.github_username);
        const byDate = this.aggregateEventsByDay(events);

        for (const [date, counts] of Object.entries(byDate)) {
            await GithubRepository.upsertActivity(
                user.organization_id,
                user.id,
                date,
                counts.commit_count,
                counts.pull_requests,
                counts.issues_closed
            );
        }

        return { synced: true, daysUpdated: Object.keys(byDate).length };
    }

    async syncOwnAccount(userId) {
        const user = await GithubRepository.findUserForSync(userId);
        if (!user) {
            throw new Error("User not found");
        }
        return this.syncUser(user);
    }

    async syncAllUsers(organizationId = null) {
        const users = await GithubRepository.findUsersWithGithubUsername(organizationId);
        const results = [];

        for (const user of users) {
            try {
                const result = await this.syncUser(user);
                results.push({ userId: user.id, ...result });
            } catch (error) {
                results.push({ userId: user.id, synced: false, reason: error.message });
            }
        }

        return results;
    }

    async getActivity(userId, from, to) {
        return GithubRepository.findByUserRange(userId, from, to);
    }
}

module.exports = new GithubService();
