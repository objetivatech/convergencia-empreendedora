import { useState, useEffect } from "react";
import { useAuth } from "./useAuth";
import { useUserRoles } from "./useUserRoles";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

interface AdminStats {
  totalUsers: number;
  totalBusinesses: number;
  totalSubscriptions: number;
  totalRevenue: number;
  newUsersThisMonth: number;
  activeSubscriptions: number;
}

interface UserPermission {
  id: string;
  user_id: string;
  permission_name: string;
  granted_by: string | null;
  granted_at: string;
  expires_at: string | null;
  active: boolean;
}

export const useAdminPermissions = () => {
  const { user } = useAuth();
  const { isAdmin } = useUserRoles();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAdmin() && user) {
      loadAdminStats();
    } else {
      setLoading(false);
    }
  }, [user, isAdmin]);

  const loadAdminStats = async () => {
    try {
      // Use the new secure admin stats function instead of direct table access
      const { data, error } = await supabase.rpc('get_admin_stats');
      
      if (error) {
        console.error('Error loading admin stats:', error);
        return;
      }

      if (data && data.length > 0) {
        const statsData = data[0];
        setStats({
          totalUsers: statsData.total_users || 0,
          totalBusinesses: statsData.total_businesses || 0,
          totalSubscriptions: statsData.total_subscriptions || 0,
          totalRevenue: 0, // Will be calculated from actual payments
          newUsersThisMonth: statsData.new_users_this_month || 0,
          activeSubscriptions: statsData.active_subscriptions || 0
        });
      }
    } catch (error) {
      console.error('Error loading admin stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const grantPermission = async (userId: string, permissionName: string, expiresAt?: Date) => {
    if (!isAdmin() || !user) return;

    try {
      const { error } = await supabase.from('user_permissions').insert({
        user_id: userId,
        permission_name: permissionName,
        granted_by: user.id,
        expires_at: expiresAt?.toISOString() || null
      });

      if (error) throw error;

      // Log admin activity (will be implemented later)
      console.log('Admin activity logged:', {
        admin_id: user.id,
        action: 'grant_permission',
        target: userId,
        details: { permission: permissionName, expires_at: expiresAt }
      });

      return true;
    } catch (error) {
      console.error('Error granting permission:', error);
      return false;
    }
  };

  const revokePermission = async (permissionId: string) => {
    if (!isAdmin() || !user) return;

    try {
      const { error } = await supabase
        .from('user_permissions')
        .update({ active: false })
        .eq('id', permissionId);

      if (error) throw error;

      // Log admin activity (will be implemented later)
      console.log('Admin activity logged:', {
        admin_id: user.id,
        action: 'revoke_permission',
        target: permissionId
      });

      return true;
    } catch (error) {
      console.error('Error revoking permission:', error);
      return false;
    }
  };

  const getUserPermissions = async (userId: string): Promise<UserPermission[]> => {
    if (!isAdmin()) return [];

    try {
      const { data, error } = await supabase
        .from('user_permissions')
        .select('*')
        .eq('user_id', userId)
        .eq('active', true);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching user permissions:', error);
      return [];
    }
  };

  const updateUserRole = async (userId: string, role: Database["public"]["Enums"]["user_role"], action: 'add' | 'remove') => {
    if (!isAdmin() || !user) return;

    try {
      const rpcFunction = action === 'add' ? 'add_user_role' : 'remove_user_role';
      const rpcParams = action === 'add' 
        ? { user_uuid: userId, new_role: role }
        : { user_uuid: userId, old_role: role };
      
      const { error } = await supabase.rpc(rpcFunction, rpcParams);

      if (error) throw error;

      // Log admin activity (will be implemented later)
      console.log('Admin activity logged:', {
        admin_id: user.id,
        action: `${action}_role`,
        target: userId,
        details: { role, action }
      });

      return true;
    } catch (error) {
      console.error(`Error ${action}ing user role:`, error);
      return false;
    }
  };

  const toggleAdminStatus = async (userId: string, isAdminFlag: boolean) => {
    if (!isAdmin() || !user) return false;

    try {
      const { data, error } = await supabase.rpc('secure_toggle_admin_status', {
        target_user_id: userId,
        new_admin_status: isAdminFlag
      });

      if (error) throw error;
      return data || false;
    } catch (error) {
      console.error('Error updating admin status:', error);
      return false;
    }
  };

  const toggleBlogEditor = async (userId: string, canEdit: boolean) => {
    if (!isAdmin() || !user) return false;

    try {
      const { data, error } = await supabase.rpc('secure_toggle_blog_editor', {
        target_user_id: userId,
        new_editor_status: canEdit
      });

      if (error) throw error;
      return data || false;
    } catch (error) {
      console.error('Error updating blog editor status:', error);
      return false;
    }
  };

  return {
    stats,
    loading,
    isAdmin: isAdmin(),
    grantPermission,
    revokePermission,
    getUserPermissions,
    updateUserRole,
    toggleAdminStatus,
    toggleBlogEditor,
    refreshStats: loadAdminStats
  };
};