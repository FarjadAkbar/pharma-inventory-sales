import { DataSource } from 'typeorm';
import { hash } from '@node-rs/bcrypt';
import { Permission } from '../../../identity-service/src/entities/permission.entity';
import { Role } from '../../../identity-service/src/entities/role.entity';
import { User } from '../../../identity-service/src/entities/user.entity';

export async function seedIdentity(ds: DataSource) {
  const permRepo = ds.getRepository(Permission);
  const roleRepo = ds.getRepository(Role);
  const userRepo = ds.getRepository(User);

  const requiredPermissions: Array<{
    name: string;
    description: string;
    resource: string;
    action: string;
  }> = [
    { name: 'users.create', description: 'Create users', resource: 'users', action: 'create' },
    { name: 'users.read', description: 'View users', resource: 'users', action: 'read' },
    { name: 'users.update', description: 'Update users', resource: 'users', action: 'update' },
    { name: 'users.delete', description: 'Delete users', resource: 'users', action: 'delete' },
    // Module-level "manage" permissions (preferred for role assignment)
    { name: 'identity.manage', description: 'Manage identity and access', resource: 'identity', action: 'manage' },
    { name: 'master_data.manage', description: 'Manage master data', resource: 'master_data', action: 'manage' },
    { name: 'roles.manage', description: 'Manage roles', resource: 'roles', action: 'manage' },
    { name: 'sites.manage', description: 'Manage sites', resource: 'sites', action: 'manage' },
    { name: 'procurement.manage', description: 'Manage procurement', resource: 'procurement', action: 'manage' },
    { name: 'manufacturing.manage', description: 'Manage manufacturing', resource: 'manufacturing', action: 'manage' },
    { name: 'quality.manage', description: 'Manage quality', resource: 'quality', action: 'manage' },
    { name: 'warehouse.manage', description: 'Manage warehouse', resource: 'warehouse', action: 'manage' },
    { name: 'distribution.manage', description: 'Manage distribution', resource: 'distribution', action: 'manage' },
    { name: 'sales.manage', description: 'Manage sales and POS', resource: 'sales', action: 'manage' },
    // Resource-level manage (use this when you want single-resource control)
    { name: 'raw_materials.manage', description: 'Manage raw materials', resource: 'raw_materials', action: 'manage' },
  ];

  const existing = await permRepo.find();
  const existingByName = new Map(existing.map((p) => [p.name, p]));
  const toInsert = requiredPermissions.filter((p) => !existingByName.has(p.name));
  if (toInsert.length > 0) {
    await permRepo.save(toInsert);
    console.log(`  Identity: added ${toInsert.length} missing permissions.`);
  }

  const permissions = await permRepo.find({ order: { id: 'ASC' } });
  const allPermissionIds = permissions.map((p) => p.id).join(',');

  const permCount = permissions.length;
  if (permCount > 0) {
    console.log('  Identity: ensuring system_admin role has all permissions.');
    const result = await roleRepo.update(
      { name: 'system_admin' },
      { permissionIds: allPermissionIds },
    );
    if (result.affected !== undefined && result.affected > 0) {
      console.log('  Identity: system_admin role permissionIds updated.');
    } else {
      console.log('  Identity: system_admin role not found.');
    }
  }

  if (await roleRepo.count()) {
    return;
  }

  const adminRole = await roleRepo.save({
    name: 'system_admin',
    description: 'System Administrator',
    permissionIds: allPermissionIds,
  });

  const hashedPassword = await hash('Admin@123', 10);
  await userRepo.save({
    name: 'Admin User',
    email: 'admin@pharma.local',
    password: hashedPassword,
    roleId: adminRole.id,
    siteIds: '',
  });

  await userRepo.save({
    name: 'John Doe',
    email: 'john@pharma.local',
    password: await hash('User@123', 10),
    roleId: adminRole.id,
    siteIds: '1',
  });

  console.log('  Identity: permissions, roles, users seeded.');
}
