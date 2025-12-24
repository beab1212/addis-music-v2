"use client";

import React, { useEffect, useState, useRef } from "react";
import { api } from '@/lib/api';
import { X, Save, Tag, Search, FormInputIcon, Shield, UserCheck, UserX, Key, Eye, EyeOff } from "lucide-react";
import { authClient } from '@/lib/auth-client';
import { useToastStore } from '@/store/toastStore';

const RolePiker: React.FC<{
    currentRole: string;
    onSelect: (role: string) => void;
    onClose: () => void;
}> = ({ currentRole, onSelect, onClose }) => {
    const roles = [
        { key: "admin", label: "Admin", desc: "Full access to everything(Critical)" },
        { key: "user", label: "User", desc: "Listen to music" },
    ];

    const [selected, setSelected] = useState<string>(currentRole || "user");

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <div
                className="relative z-10 w-full max-w-md bg-white dark:bg-[#0b0b0d] rounded-2xl border border-gray-200 dark:border-gray-800 shadow-2xl p-6"
                role="dialog"
                aria-modal="true"
                aria-labelledby="role-picker-title"
            >
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h3 id="role-picker-title" className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                            Select role
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Choose a role for the user. Use arrow keys to navigate, Enter to confirm.
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        aria-label="Close"
                        className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="mt-4 space-y-3" role="radiogroup" aria-label="Roles">
                    {roles.map((r, i) => {
                        const active = selected === r.key;
                        return (
                            <button
                                key={r.key}
                                onClick={() => setSelected(r.key)}
                                className={`w-full flex items-center justify-between gap-4 p-3 rounded-lg border transition ${active
                                    ? "border-orange-500 bg-orange-50 dark:bg-orange-900/30"
                                    : "border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0b0b0d] hover:bg-gray-50 dark:hover:bg-gray-900/30"
                                    }`}
                                aria-checked={active}
                                role="radio"
                            >
                                <div>
                                    <div className="flex items-center gap-2">
                                        <Shield size={16} className="text-orange-500" />
                                        <span className="font-medium text-gray-900 dark:text-gray-100">{r.label}</span>
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{r.desc}</p>
                                </div>
                                <div>
                                    {active ? (
                                        <span className="inline-flex items-center gap-2 text-orange-600 font-medium">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="opacity-90">
                                                <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </span>
                                    ) : (
                                        <span className="text-xs text-gray-400">Select</span>
                                    )}
                                </div>
                            </button>
                        );
                    })}
                </div>

                <div className="mt-6 flex items-center justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => onSelect(selected)}
                        className="px-4 py-2 rounded-md bg-orange-600 text-white hover:bg-orange-700 transition"
                    >
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
};


type Props = {
    open: boolean;
    user: any;
    onClose: () => void;
    onSave: (userId: string) => Promise<void> | void;
};

export default function UserModal({ open, user, onClose, onSave }: Props) {
    const { addToast } = useToastStore();
    const [saving, setSaving] = useState(false);

    // form fields
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [role, setRole] = useState("user");

    const [loadingRelations, setLoadingRelations] = useState(false);
    const [sessions, setSessions] = useState<any[]>([]);
    const [showSessions, setShowSessions] = useState(false);

    // roles picker
    const [showRolePicker, setShowRolePicker] = useState(false);

    // Initialize form fields when user changes
    useEffect(() => {
        if (user && user !== "new") {
            setName(user.name || "");
            setEmail(user.email || "");
            setRole(user.role || "user");
        } else {
            setName("");
            setEmail("");
            setRole("user");
        }
    }, [user]);

    // Callbacks
    const handleSaveOrCreate = async () => {
        if (saving) return;
        setSaving(true);
        try {
            if (!user || user === "new") {
                // Create user using authClient.admin
                const { data: newUser, error } = await authClient.admin.createUser({
                    email,
                    password: "temp-password", // Better to prompt or generate
                    name,
                    role: "user",
                });
                if (error) throw error;
                const id = newUser?.user?.id ?? "";
                addToast("User created successfully.", "success");
                if (onSave) await onSave(id);
            } else {
                // Update user using authClient.admin
                const { data, error } = await authClient.admin.updateUser({
                    userId: user.id,
                    data: { name, role },
                });
                if (error) throw error;
                addToast("User updated successfully.", "success");
                if (onSave) await onSave(user.id);
            }
        } catch (err: any) {
            console.error(err);
            addToast(err?.message || "Failed to save user", "error");
        } finally {
            setSaving(false);
        }
    };

    const handleSetRole = async (newRole: string) => {
        if (!user || user === "new") return;
        if (newRole === role) {
            addToast("Role is already set to the selected value.", "info");
            return;
        }

        try {
            if (newRole !== "admin" && newRole !== "user") {
                addToast("Invalid role selected.", "error");
                return;
            }
            const { data, error } = await authClient.admin.setRole({
                userId: user.id,
                role: newRole,
            });

            if (error) throw error;
            addToast("Role updated successfully.", "success");
            if (onSave) await onSave(user.id);
        } catch (err: any) {
            console.error(err);
            addToast(err?.message || "Failed to set role", "error");
        } finally {
            setShowRolePicker(false);
        }
    };

    const handleResetPassword = async () => {
        if (!user || user === "new") return;
        if (!confirm("Send password reset to this user?")) return;
        setLoadingRelations(true);
        try {
            const newPassword = prompt("Enter new password for the user:", "");
            if (!newPassword) {
                addToast("Password reset cancelled.", "info");
                return;
            }
            const { data, error } = await authClient.admin.setUserPassword({
                newPassword,
                userId: user.id,
            });
            if (error) throw error;
            addToast("Password reset successfully.", "success");
        } catch (err: any) {
            console.error(err);
            addToast(err?.message || "Failed to reset password", "error");
        } finally {
            setLoadingRelations(false);
        }
    };

    const handleToggleBan = async () => {
        if (!user || user === "new") return;
        const isBanned = user?.banned;
        const action = isBanned ? "unban" : "ban";
        if (!confirm(`${action.charAt(0).toUpperCase() + action.slice(1)} this user?`)) return;
        try {
            const { data, error } = isBanned
                ? await authClient.admin.unbanUser({ userId: user.id })
                : await authClient.admin.banUser({ userId: user.id });
            if (error) throw error;
            addToast(`User ${isBanned ? "unbanned" : "banned"} successfully.`, "success");
            if (onSave) onSave(user.id);
        } catch (err: any) {
            console.error(err);
            addToast(err?.message || "Failed to update status", "error");
        }
    };

    const handleListSessions = async () => {
        if (!user || user === "new") return;
        setLoadingRelations(true);
        try {
            const { data, error } = await authClient.admin.listUserSessions({
                userId: user.id,
            });
            if (error) throw error;
            setSessions(data?.sessions || []);
            setShowSessions(true);
        } catch (err: any) {
            console.error(err);
            addToast(err?.message || "Failed to list sessions", "error");
        } finally {
            setLoadingRelations(false);
        }
    };

    const handleRevokeSession = async (sessionId: string) => {
        try {
            if (sessions.length === 0 || !sessionId) return;
            if (!confirm("Revoke this session?")) return;

            const { data, error } = await authClient.admin.revokeUserSession({
                sessionToken: sessionId,
            });
            if (error) throw error;
            addToast("Session revoked.", "success");
            setSessions(sessions.filter(s => s.id !== sessionId));
        } catch (err: any) {
            console.error(err);
            addToast(err?.message || "Failed to revoke session", "error");
        }
    };

    const handleRevokeAllSessions = async () => {
        if (!confirm("Revoke all sessions for this user?")) return;
        try {
            const { data, error } = await authClient.admin.revokeUserSessions({
                userId: user.id, // required
            });
            if (error) throw error;
            addToast("All sessions revoked.", "success");
            setSessions([]);
        } catch (err: any) {
            console.error(err);
            addToast(err?.message || "Failed to revoke sessions", "error");
        }
    };

    const handleImpersonate = async () => {
        if (!user || user === "new") return;
        if (!confirm("Impersonate this user?")) return;
        try {
            const { data, error } = await authClient.admin.impersonateUser({
                userId: user.id,
            });
            if (error) throw error;
            addToast("Impersonating user.", "success");
            // Redirect or handle impersonation
        } catch (err: any) {
            console.error(err);
            addToast(err?.message || "Failed to impersonate", "error");
        }
    };

    const handleStopImpersonating = async () => {
        try {
            const { data, error } = await authClient.admin.stopImpersonating();
            if (error) throw error;
            addToast("Stopped impersonating.", "success");
        } catch (err: any) {
            console.error(err);
            addToast(err?.message || "Failed to stop impersonation", "error");
        }
    };

    const handleDelete = async () => {
        if (!confirm("Permanently delete this user? This action cannot be undone.")) return;
        setLoadingRelations(true);
        try {
            const { data: deletedUser, error } = await authClient.admin.removeUser({
                userId: user.id,
            });
            if (error) throw error;
            addToast("User deleted successfully.", "success");
            onClose();
        } catch (err: any) {
            console.error(err);
            addToast(err?.message || "Failed to delete user", "error");
        } finally {
            setLoadingRelations(false);
        }
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 overflow-hidden">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={() => !saving && onClose()}
            />

            {/* Modal Container */}
            <div className="
                relative z-10 w-full max-w-7xl
                bg-white dark:bg-[#0f0f12]
                border border-gray-200 dark:border-gray-800/70
                ring-1 ring-black/5 dark:ring-white/5
                rounded-2xl shadow-2xl
                flex flex-col
                max-h-screen 
            ">
                {/* Header - Fixed */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="rounded-full bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 p-2">
                            <Tag size={18} />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                {!user || user === "new" ? "Create User" : "Edit User"}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {!user || user === "new" ? "New User" : `User ID: ${user?.email}`}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => !saving && onClose()}
                        className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Scrollable Body */}
                <div className="flex-1 overflow-y-auto px-6 py-6 text-gray-700 dark:text-gray-300 space-y-6 modern-scrollbar-minimal">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <label className="flex flex-col">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Name</span>
                            <input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="mt-1 px-3 py-2 rounded-md border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0b0b0d] focus:outline-none focus:ring-2 focus:ring-orange-500"
                                placeholder="Full name"
                            />
                        </label>

                        <label className="flex flex-col">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Email</span>
                            <input
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                readOnly={!!user && user !== "new"}
                                className="mt-1 px-3 py-2 rounded-md border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0b0b0d] focus:outline-none"
                                placeholder="User email (required for invites)"
                            />
                        </label>

                        {/* <label className="flex flex-col">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Role</span>
                            <select
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                className="mt-1 px-3 py-2 rounded-md border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0b0b0d] focus:outline-none focus:ring-2 focus:ring-orange-500"
                            >
                                <option value="user">User</option>
                                <option value="admin">Admin</option>
                            </select>
                        </label> */}

                        <div className="col-span-full">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Actions</span>
                            <div className="mt-3 flex flex-wrap gap-3">
                                {/* Save / Create */}
                                <button
                                    onClick={handleSaveOrCreate}
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-orange-600 text-white hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                >
                                    {saving ? "Saving..." : (!user || user === "new" ? "Create User" : "Save Changes")}
                                </button>

                                {/* Set Role */}
                                {user && user !== "new" && (
                                    <button
                                        onClick={() => { setShowRolePicker(true); }}
                                        className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-gray-300 dark:text-black/80 bg-white hover:bg-gray-50 transition"
                                    >
                                        <Shield size={16} /> Set Role
                                    </button>
                                )}

                                {/* Reset password */}
                                {user && user !== "new" && (
                                    <button
                                        onClick={handleResetPassword}
                                        className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-gray-300 dark:text-black/80 bg-white hover:bg-gray-50 transition"
                                    >
                                        <Key size={16} /> Reset Password
                                    </button>
                                )}

                                {/* Toggle Active (Ban/Unban) */}
                                {user && user !== "new" && (
                                    <button
                                        onClick={handleToggleBan}
                                        className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-gray-300 dark:text-black/80 bg-white hover:bg-gray-50 transition"
                                    >
                                        {user?.banned ? <UserCheck size={16} /> : <UserX size={16} />} {user?.banned ? "Unban" : "Ban"} User
                                    </button>
                                )}

                                {/* List Sessions */}
                                {user && user !== "new" && (
                                    <button
                                        onClick={handleListSessions}
                                        className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-gray-300 dark:text-black/80 bg-white hover:bg-gray-50 transition"
                                    >
                                        <Eye size={16} /> List Sessions
                                    </button>
                                )}

                                {/* Revoke All Sessions */}
                                {user && user !== "new" && (
                                    <button
                                        onClick={handleRevokeAllSessions}
                                        className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-gray-300 dark:text-black/80 bg-white hover:bg-gray-50 transition"
                                    >
                                        <EyeOff size={16} /> Revoke All Sessions
                                    </button>
                                )}

                                {/* Impersonate */}
                                {user && user !== "new" && (
                                    <button
                                        onClick={handleImpersonate}
                                        className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-gray-300 dark:text-black/80 bg-white hover:bg-gray-50 transition"
                                    >
                                        <UserCheck size={16} /> Impersonate
                                    </button>
                                )}

                                {/* Stop Impersonating */}
                                <button
                                    onClick={handleStopImpersonating}
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-gray-300 dark:text-black/80 bg-white hover:bg-gray-50 transition"
                                >
                                    <UserX size={16} /> Stop Impersonating
                                </button>

                                {/* Delete */}
                                {user && user !== "new" && (
                                    <button
                                        onClick={handleDelete}
                                        className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-red-400 bg-red-50 text-red-700 hover:bg-red-100 transition"
                                    >
                                        Delete User
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Sessions List */}
                        {showSessions && sessions.length > 0 && (
                            <div className="col-span-full">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Active Sessions</span>
                                <div className="mt-3 space-y-2">
                                    {sessions.map((session, i) => (
                                        <div key={i} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-800 rounded-md">
                                            <div>
                                                <p className="text-sm">Device: {session.device || 'Unknown'}</p>
                                                <p className="text-xs text-gray-500">Created: {new Date(session.createdAt).toLocaleString()}</p>
                                            </div>
                                            <button
                                                onClick={() => handleRevokeSession(session.id)}
                                                className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                                            >
                                                Revoke
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>


                {/* Footer - Fixed */}
                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-800 flex-shrink-0 bg-white dark:bg-[#0f0f12]">
                    <button
                        onClick={() => !saving && onClose()}
                        className="px-5 py-2.5 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                    >
                        Cancel
                    </button>
                    <button
                        disabled={saving || loadingRelations}
                        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-md bg-orange-600 text-white hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                        {saving ? "Saving..." : <><Save size={16} /> {!user || user == "new" ? "Create User" : "Update User"}</>}
                    </button>
                </div>
            </div>
            {showRolePicker && (
                <RolePiker
                    currentRole={role}
                    onSelect={(newRole) => {
                        handleSetRole(newRole);
                    }}
                    onClose={() => setShowRolePicker(false)}
                />
            )}
        </div>
    );
}

