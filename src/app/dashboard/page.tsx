import { requireSession } from '@/lib/require-role';
import { UserCog, GraduationCap, Users, School, ClipboardList, BookOpenIcon, Target, CheckCircle2 } from 'lucide-react';
import { FaChalkboard, FaUsers } from 'react-icons/fa';
import { StatCard } from '@/features/dashboard/components/stat-card';
import { ScoreBarChart } from '@/features/dashboard/components/score-bar-chart';
import { getAdminDashboardStats } from '@/features/dashboard/queries/get-admin-dashboard-stats';
import { getCoordinatorDashboardData } from '@/features/dashboard/queries/get-coordinator-dashboard-data';
import { getTeacherDashboardData } from '@/features/dashboard/queries/get-teacher-dashboard-data';
import { getStudentDashboardData } from '@/features/dashboard/queries/get-student-dashboard-data';

export default async function DashboardPage() {
  const session = await requireSession();
  const role = session.user.role.toLowerCase();

  if (role === 'admin' || role === 'superadmin') {
    const stats = await getAdminDashboardStats();

    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Selamat datang, {session.user.name}</h1>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard label="Koordinator" value={stats.coordinatorCount} icon={UserCog} />
          <StatCard label="Guru" value={stats.teacherCount} icon={GraduationCap} />
          <StatCard label="Siswa" value={stats.studentCount} icon={Users} />
          <StatCard label="Kelas" value={stats.classroomCount} icon={FaChalkboard} />
          <StatCard label="Kelompok" value={stats.groupCount} icon={FaUsers} />
        </div>
      </div>
    );
  }

  if (role === 'coordinator') {
    const data = await getCoordinatorDashboardData();

    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Selamat datang, {session.user.name}</h1>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Kelompok Aktif" value={data.groupCount} icon={FaUsers} />
          <StatCard label="Siswa Berkelompok" value={data.studentCount} icon={School} />
          <StatCard label="Tashih Menunggu" value={data.pendingTashihCount} icon={ClipboardList} />
          <StatCard label="Munaqasyah Menunggu" value={data.pendingMunaqasyahCount} icon={ClipboardList} />
        </div>

        <ScoreBarChart
          title="Rata-rata Nilai per Kelompok"
          data={data.groupScores}
          series={[
            { key: 'tahfidz', label: 'Tahfidz', color: 'var(--chart-1)' },
            { key: 'tahsin', label: 'Tahsin', color: 'var(--chart-2)' },
          ]}
        />
      </div>
    );
  }

  if (role === 'teacher') {
    const data = await getTeacherDashboardData();

    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Selamat datang, {session.user.name}</h1>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard label="Kelompok Bimbingan" value={data.groupCount} icon={FaUsers} />
          <StatCard label="Siswa Bimbingan" value={data.studentCount} icon={School} />
          <StatCard label="Setoran Bulan Ini" value={data.submissionsThisMonth} icon={BookOpenIcon} />
        </div>

        <ScoreBarChart
          title="Nilai Terkini Siswa Bimbingan"
          data={data.studentScores}
          series={[
            { key: 'tahfidz', label: 'Tahfidz', color: 'var(--chart-1)' },
            { key: 'tahsin', label: 'Tahsin', color: 'var(--chart-2)' },
          ]}
        />
      </div>
    );
  }

  const data = await getStudentDashboardData();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Selamat datang, {session.user.name}</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Target Berjalan" value={data.activeTargetCount} icon={Target} />
        <StatCard label="Target Tercapai" value={data.achievedTargetCount} icon={CheckCircle2} />
        <StatCard label="Total Setoran" value={data.submissionCount} icon={BookOpenIcon} />
      </div>

      <ScoreBarChart
        title="Nilai Terbaru Anda"
        data={data.scoreChart}
        series={[{ key: 'score', label: 'Nilai', color: 'var(--chart-1)' }]}
      />
    </div>
  );
}
