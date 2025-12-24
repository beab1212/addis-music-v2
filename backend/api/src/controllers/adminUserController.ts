import type { Request, Response } from 'express';
import { CustomErrors } from '../errors';
import { uuidSchema, searchSchema, paginationSchema } from '../validators';
import { auth } from "../libs/auth";
import { userRole, strongPasswordSchema, userSessionSchema } from '../validators/adminUserValidator';
import { userIdSchema } from "../validators";


export const adminUserController = {
    listUsers: async (req: Request, res: Response) => {

        const users = await auth.api.listUsers({
            query: {
                searchValue: "some name",
                searchField: "name",
                searchOperator: "contains",
                limit: 100,
                offset: 100,
                sortBy: "name",
                sortDirection: "desc",
                filterField: "email",
                filterValue: "hello@example.com",
                filterOperator: "eq",
            },
            // This endpoint requires session cookies.
            // headers: await headers(),
            headers: req.headers as any,
        });

        if (!users) {
            throw new CustomErrors.BadRequestError('Failed to fetch users');
        }

        res.json({
            success: true,
            data: users,
        })
    },

    setRole: async (req: Request, res: Response) => {
        const { role } = userRole.parse(req.body);
        const userId = userIdSchema.parse(req.body?.userId);

        const data = await auth.api.setRole({
            body: {
                userId: userId,
                role: role, // required
            },
            // This endpoint requires session cookies.
            headers: req.headers as any,
        });

        if (!data) {
            throw new CustomErrors.BadRequestError('Failed to update user role');
        }

        res.json({
            success: true,
            message: `User role updated to ${role}`,
            data: data,
        })
    },

    setUserPassword: async (req: Request, res: Response) => {
        const password = strongPasswordSchema.parse(req.body?.password);
        const userId = userIdSchema.parse(req.body?.userId);

        if (typeof password !== 'string' || password.length < 6) {
            throw new CustomErrors.BadRequestError('Password must be at least 6 characters long');
        }

        const data = await auth.api.setUserPassword({
            body: {
                userId: userId,
                newPassword: password,
            },
            // This endpoint requires session cookies.
            headers: req.headers as any,
        });

        if (!data) {
            throw new CustomErrors.BadRequestError('Failed to update user password');
        }

        res.json({
            success: true,
            message: `User password updated successfully`,
            data: data,
        });
    },

    banUser: async (req: Request, res: Response) => {
        const userId = userIdSchema.parse(req.body?.userId);

        await auth.api.banUser({
            body: {
                userId: userId, // required
                banReason: "Spamming",
                banExpiresIn: 60 * 60 * 24 * 7,
            },
            // This endpoint requires session cookies.
            headers: req.headers as any,
        });

        res.json({
            success: true,
            message: `User has been banned successfully`,
            data: null,
        });
    },

    unBanUser: async (req: Request, res: Response) => {
        const userId = userIdSchema.parse(req.body?.userId);

        await auth.api.unbanUser({
            body: {
                userId: userId, // required
            },
            // This endpoint requires session cookies.
            headers: req.headers as any,
        });
        res.json({
            success: true,
            message: `User has been unbanned successfully`,
            data: null,
        });
    },

    listUserSessions: async (req: Request, res: Response) => {
        const userId = userIdSchema.parse(req.body?.userId);

        const data = await auth.api.listUserSessions({
            body: {
                userId: userId, // required
            },
            // This endpoint requires session cookies.
            headers: req.headers as any,
        });

        res.json({
            success: true,
            data: data,
        });
    },

    revokeUserSession: async (req: Request, res: Response) => {
        const { sessionToken } = userSessionSchema.parse(req.body);

        const data = await auth.api.revokeUserSession({
            body: {
                sessionToken: sessionToken, // required
            },
            // This endpoint requires session cookies.
            headers: req.headers as any,
        });

        res.json({
            success: true,
            message: `Not Implemented yet`,
            data: null,
        });
    },

    revokeAllUserSessions: async (req: Request, res: Response) => {
        const userId = userIdSchema.parse(req.body?.userId);
        const data = await auth.api.revokeUserSessions({
            body: {
                userId: "user-id", // required
            },
            // This endpoint requires session cookies.
            headers: req.headers as any,
        });

        if (!data.success) {
            throw new CustomErrors.BadRequestError('Failed to revoke user sessions');
        }
        res.json({
            success: true,
            message: `All user sessions revoked successfully`,
            data: data,
        });
    },

    impersonateUser: async (req: Request, res: Response) => {
        const userId = userIdSchema.parse(req.body?.userId);

        const data = await auth.api.impersonateUser({
            body: {
                userId: userId, // required
            },
            // This endpoint requires session cookies.
            headers: req.headers as any,
        });

        if (!data) {
            throw new CustomErrors.BadRequestError('Failed to impersonate user');
        }

        res.json({
            success: true,
            message: `Impersonation successful`,
            data: data,
        });
    },

    stopImpersonation: async (req: Request, res: Response) => {
        const data = await auth.api.stopImpersonating({
            // This endpoint requires session cookies.
            headers: req.headers as any,
        });

        if (!data) {
            throw new CustomErrors.BadRequestError('Failed to stop impersonation');
        }

        res.json({
            success: true,
            message: `Stopped impersonation successfully`,
            data: null,
        });
    },

    removeUser: async (req: Request, res: Response) => {
        const userId = userIdSchema.parse(req.body?.userId);

        const deletedUser = await auth.api.removeUser({
            body: {
                userId: userId, // required
            },
            // This endpoint requires session cookies.
            headers: req.headers as any,
        });

        if (!deletedUser) {
            throw new CustomErrors.BadRequestError('Failed to delete user');
        }

        res.json({
            success: true,
            message: `User deleted successfully`,
            data: deletedUser,
        });
    }
};