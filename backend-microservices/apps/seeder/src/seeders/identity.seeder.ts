import { DataSource } from 'typeorm';
import { hash } from '@node-rs/bcrypt';
import { Permission } from '../../../identity-service/src/entities/permission.entity';
import { Role } from '../../../identity-service/src/entities/role.entity';
import { User } from '../../../identity-service/src/entities/user.entity';

export async function seedIdentity(ds: DataSource) {
  const permRepo = ds.getRepository(Permission);
  const roleRepo = ds.getRepository(Role);
  const userRepo = ds.getRepository(User);

  const permCount = await permRepo.count();
  if (permCount > 0) {
    console.log('  Identity: already has data, ensuring system_admin role has permissions.');
    const permissions = await permRepo.find({ order: { id: 'ASC' } });
    const ids = permissions.slice(0, 9).map((p) => p.id).join(',');
    const result = await roleRepo.update(
      { name: 'system_admin' },
      { permissionIds: ids },
    );
    if (result.affected !== undefined && result.affected > 0) {
      console.log('  Identity: system_admin role permissionIds updated.');
    } else {
      console.log('  Identity: system_admin role not found or already up to date.');
    }
    return;
  }

  const permissions = await permRepo.save([
    { name: 'users.create', description: 'Create users', resource: 'users', action: 'create' },
    { name: 'users.read', description: 'View users', resource: 'users', action: 'read' },
    { name: 'users.update', description: 'Update users', resource: 'users', action: 'update' },
    { name: 'users.delete', description: 'Delete users', resource: 'users', action: 'delete' },
    { name: 'roles.manage', description: 'Manage roles', resource: 'roles', action: 'manage' },
    { name: 'sites.manage', description: 'Manage sites', resource: 'sites', action: 'manage' },
    { name: 'procurement.manage', description: 'Manage procurement', resource: 'procurement', action: 'manage' },
    { name: 'quality.manage', description: 'Manage quality', resource: 'quality', action: 'manage' },
    { name: 'warehouse.manage', description: 'Manage warehouse', resource: 'warehouse', action: 'manage' },
  ]);

  const adminRole = await roleRepo.save({
    name: 'system_admin',
    description: 'System Administrator',
    permissionIds: permissions.slice(0, 5).map((p) => p.id).join(','),
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
