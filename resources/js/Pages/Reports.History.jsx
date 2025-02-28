import { useState, useEffect } from 'react';
import useRole from '@/hooks/useRole';
import { router } from '@inertiajs/react';
import AuditReportCard from '@/Components/cards/AuditReportCard';
import { filterArray } from '@/functions/filterArray';

const ReportHistory = ({ auth }) => {
  const { hasAccess, getLayout } = useRole();
  const Layout = getLayout(auth.user.type);

  const [reports, setReports] = useState();
  const [history, setHistory] = useState();
  const fetchReports = async () => {
    try {
      const response = await axios.get('/audit/report/get');
      setReports(response.data.data);
    } catch (error) {
      console.error('error');
    }
  };

  useEffect(() => {
    fetchReports();
  }, [])

  useEffect(() => {
    if (reports) {
      setHistory(filterArray(reports, 'review_status', ['Reviewed']));
    }
  }, [reports])

  const handleReportClick = (id) => {
    router.get('/reports/view', { id: id });
  };

  return (
    <AuthenticatedLayout user={auth.user}>
      <Head title="Report History" />
      <Layout user={auth.user}
        header={<BreadCrumbsHeader
          headerNames={["Reports", "History"]}
          onClickHandlers={[
            () => router.get('/reports'),
            () => router.get('/reports/history')
          ]}
        />
        }
      >
        <div className='content'>
          {
            history && history.map((report, index) => {
              return (
                <AuditReportCard data={report} key={index} onClick={() => handleReportClick(report.id)} />
              )
            })
          }
        </div>
      </Layout>
    </AuthenticatedLayout>
  )
}

export default ReportHistory;   