jest.mock("./auth.repository");
jest.mock("../../utils/hash");
jest.mock("../../utils/jwt");
jest.mock("../../mail/mail.service");
jest.mock("fs", () => ({
    readFileSync: jest.fn().mockReturnValue("<html>{{NAME}} {{RESET_LINK}}</html>")
}));

const AuthRepository = require("./auth.repository");
const { hashPassword, comparePassword } = require("../../utils/hash");
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require("../../utils/jwt");
const { sendMail } = require("../../mail/mail.service");
const AuthService = require("./auth.services");

describe("AuthService.login", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        generateAccessToken.mockReturnValue("access-token");
        generateRefreshToken.mockReturnValue("refresh-token");
    });

    const activeUser = {
        id: 1,
        email: "rahul@devpulse.com",
        password: "hashed",
        status: "Active",
        role: "Manager",
        organization_id: 2,
        team_id: 2,
        failed_login_attempts: 0,
        account_locked_until: null
    };

    test("throws invalid credentials when no user is found for the email", async () => {
        AuthRepository.findUserByEmail.mockResolvedValue(null);
        await expect(AuthService.login("nobody@x.com", "pw", "127.0.0.1")).rejects.toThrow("Invalid email or password");
    });

    test("throws account inactive when user.status is not Active", async () => {
        AuthRepository.findUserByEmail.mockResolvedValue({ ...activeUser, status: "Inactive" });
        await expect(AuthService.login(activeUser.email, "pw", "127.0.0.1")).rejects.toThrow("Account is inactive");
    });

    test("throws account locked when account_locked_until is in the future", async () => {
        const future = new Date(Date.now() + 60000);
        AuthRepository.findUserByEmail.mockResolvedValue({ ...activeUser, account_locked_until: future });
        await expect(AuthService.login(activeUser.email, "pw", "127.0.0.1")).rejects.toThrow("locked");
    });

    test("on wrong password, increments failed attempts and throws invalid credentials", async () => {
        AuthRepository.findUserByEmail.mockResolvedValue({ ...activeUser, failed_login_attempts: 1 });
        comparePassword.mockResolvedValue(false);

        await expect(AuthService.login(activeUser.email, "wrong", "127.0.0.1")).rejects.toThrow("Invalid email or password");
        expect(AuthRepository.updateFailedLoginAttempts).toHaveBeenCalledWith(activeUser.id, 2);
        expect(AuthRepository.lockAccount).not.toHaveBeenCalled();
    });

    test("locks the account after the 5th consecutive failed attempt instead of reporting invalid credentials", async () => {
        AuthRepository.findUserByEmail.mockResolvedValue({ ...activeUser, failed_login_attempts: 4 });
        comparePassword.mockResolvedValue(false);

        await expect(AuthService.login(activeUser.email, "wrong", "127.0.0.1")).rejects.toThrow("locked");
        expect(AuthRepository.lockAccount).toHaveBeenCalledWith(activeUser.id, expect.any(Date));
        expect(AuthRepository.updateFailedLoginAttempts).not.toHaveBeenCalled();
    });

    test("on correct password, returns tokens + user and resets failed attempts", async () => {
        AuthRepository.findUserByEmail.mockResolvedValue(activeUser);
        comparePassword.mockResolvedValue(true);

        const result = await AuthService.login(activeUser.email, "correct", "127.0.0.1");

        expect(result.accessToken).toBe("access-token");
        expect(result.refreshToken).toBe("refresh-token");
        expect(result.user).toEqual({
            id: activeUser.id,
            employee_code: undefined,
            name: undefined,
            email: activeUser.email,
            role: activeUser.role,
            organization_id: activeUser.organization_id,
            team_id: activeUser.team_id
        });
        expect(AuthRepository.resetFailedAttempts).toHaveBeenCalledWith(activeUser.id);
        expect(AuthRepository.updateRefreshToken).toHaveBeenCalledWith(activeUser.id, "refresh-token");
    });
});

describe("AuthService.register", () => {
    beforeEach(() => jest.clearAllMocks());

    test("rejects when the email is already registered", async () => {
        AuthRepository.findUserByEmail.mockResolvedValue({ id: 99 });
        await expect(AuthService.register({ email: "taken@x.com", password: "pw" })).rejects.toThrow("Email already exists");
        expect(hashPassword).not.toHaveBeenCalled();
    });

    test("hashes the password and creates the user with a Developer default role", async () => {
        AuthRepository.findUserByEmail.mockResolvedValue(null);
        hashPassword.mockResolvedValue("hashed-pw");
        AuthRepository.createUser.mockResolvedValue({ insertId: 5 });

        const result = await AuthService.register({ email: "new@x.com", password: "pw", name: "New Guy" });

        expect(hashPassword).toHaveBeenCalledWith("pw");
        expect(AuthRepository.createUser).toHaveBeenCalledWith(
            expect.objectContaining({ email: "new@x.com", password: "hashed-pw", role: "Developer" })
        );
        expect(result).toEqual({ id: 5, employee_code: expect.any(String) });
    });
});

describe("AuthService.forgotPassword", () => {
    beforeEach(() => jest.clearAllMocks());

    test("silently returns true without sending mail when the email doesn't exist (no user enumeration)", async () => {
        AuthRepository.findUserByEmail.mockResolvedValue(null);
        const result = await AuthService.forgotPassword("nobody@x.com", "127.0.0.1");
        expect(result).toBe(true);
        expect(sendMail).not.toHaveBeenCalled();
    });

    test("creates a reset token and emails the user when the email exists", async () => {
        AuthRepository.findUserByEmail.mockResolvedValue({ id: 7, name: "Rahul", email: "rahul@devpulse.com" });
        sendMail.mockResolvedValue(true);

        await AuthService.forgotPassword("rahul@devpulse.com", "127.0.0.1");

        expect(AuthRepository.createPasswordResetToken).toHaveBeenCalledWith(
            expect.objectContaining({ user_id: 7, created_ip: "127.0.0.1" })
        );
        expect(sendMail).toHaveBeenCalledWith(expect.objectContaining({ to: "rahul@devpulse.com" }));
    });
});

describe("AuthService.resetPassword", () => {
    beforeEach(() => jest.clearAllMocks());

    test("rejects an unknown token", async () => {
        AuthRepository.findPasswordResetToken.mockResolvedValue(null);
        await expect(AuthService.resetPassword("bad-token", "newpw")).rejects.toThrow("Invalid reset token");
    });

    test("rejects an expired token", async () => {
        AuthRepository.findPasswordResetToken.mockResolvedValue({
            user_id: 1,
            expires_at: new Date(Date.now() - 60000)
        });
        await expect(AuthService.resetPassword("expired-token", "newpw")).rejects.toThrow("expired");
    });

    test("rejects reusing the same password", async () => {
        AuthRepository.findPasswordResetToken.mockResolvedValue({
            user_id: 1,
            expires_at: new Date(Date.now() + 60000)
        });
        AuthRepository.findUserById.mockResolvedValue({ id: 1, password: "hashed", name: "Rahul", email: "r@x.com" });
        comparePassword.mockResolvedValue(true);

        await expect(AuthService.resetPassword("token", "samepw")).rejects.toThrow("cannot be the same");
    });
});
