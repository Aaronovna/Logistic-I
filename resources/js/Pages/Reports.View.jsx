import { useEffect, useState } from "react";
import { usePage } from "@inertiajs/react";
import { router } from "@inertiajs/react";
import useRole from "@/hooks/useRole";
import { dateTimeFormatLong, dateTimeFormatShort } from "@/Constants/options";
import { auditReportStatus, taskPriorityLevel } from "@/Constants/status";
import Status from "@/Components/Status";

const ReportsView = ({ auth }) => {
  const { hasAccess, getLayout, hasPermissions } = useRole();
  const Layout = getLayout(auth.user.type);

  const { props } = usePage();
  const { id } = props;

  const handleClick1 = () => {
    router.get('/reports');
  };

  const handleClick2 = (id) => {
    router.get('/reports/view', { id: id });
  };

  const [report, setReport] = useState();
  const fetchReport = async (id) => {
    try {
      const response = await axios.get(`/audit/report/get/${id}`);
      setReport(response.data.data);
    } catch (error) {
      toast.error(`${error.status} ${error.response.data.message}`);
    }
  }

  const [evidences, setEvidences] = useState([]);

  const fetchImages = async () => {
    try {
      const requests = JSON.parse(report.files).map(id => axios.get(`/file/get/${id}`));
      const responses = await Promise.all(requests);

      setEvidences(responses.map(response => response.data.data));
    } catch (error) {
      toast.error(`${error.status} ${error.response.data.message}`);
    }
  };

  useEffect(() => {
    if (report) {
      fetchImages();
    }
  }, [report])

  useEffect(() => {
    fetchReport(id);
  }, [])

  const updateTaskStatus = async (rid, tid) => {
    const reportPayload = {
      review_status: 'Reviewed',
      reviewed_by: auth.user.id
    }

    try {
      const reportResponse = await axios.patch(`/audit/report/update/${rid}`, reportPayload);
      if (reportResponse.status === 200) {
        const payload = { status: 'Completed' };

        try {
          const response = await axios.patch(`/audit/task/update/${tid}`, payload);
          fetchReport(id);
        } catch (updateError) {
          toast.error(`${error.status} ${error.response.data.message}`);
        }

      }
    } catch (error) {
      toast.error(`${error.status} ${error.response.data.message}`);
    }
  }

  const [viewMediaModal, setViewMediaModal] = useState(false);
  const [media, setMedia] = useState(null);

  return (
    <AuthenticatedLayout user={auth.user}>
      <Head title="View Peport" />
      <Layout user={auth.user}
        header={<BreadCrumbsHeader
          headerNames={["Reports", "View"]}
          onClickHandlers={[
            () => handleClick1(),
            () => handleClick2(id)
          ]} />
        }
      >
        {!hasAccess(auth.user.type, [2050, 2051, 2054, 2055]) ? <Unauthorized /> :
          <div className="content">
            <div className="border-card p-8">
              <p className="font-medium text-xl mb-2 ml-1">Task Details</p>
              <div className="bg-gray-100 p-4 rounded-md">
                <div className="flex items-end">
                  <p className="text-lg font-semibold">{report?.task_title}</p>
                  <Status statusArray={auditReportStatus} status={report?.review_status} className="ml-auto mr-2" />
                  <Status statusArray={taskPriorityLevel} status={report?.task_priority} suffix="Priority" />
                </div>
                <p className="font-medium text-gray-600 mt-1">
                  {`${new Date(report?.task_startdate).toLocaleString(undefined, dateTimeFormatShort)} - ${new Date(report?.task_deadline).toLocaleString(undefined, dateTimeFormatShort)}`}
                </p>
                <p className="mt-8 font-semibold">{report?.task_type}</p>
                <p className="text-gray-600 text-sm">Assigned by {report?.task_assigned_by_name}</p>
                <p className="font-medium mt-6">Scope: {report?.task_scope}</p>
                <p className="my-2 text-gray-600">{report?.task_description}</p>
              </div>

              <p className="font-medium text-xl mt-8 mb-2 ml-1">Report's Summary</p>
              <div className="bg-gray-100 p-4 rounded-md">
                <p className="font-semibold text-lg">{report?.location}</p>
                <p>Submmited on {new Date(report?.created_at).toLocaleString(undefined, dateTimeFormatLong)}</p>
                <p className="mt-8">{report?.details}</p>
                <p className="mt-4">{report?.final_comment}</p>

                <div className="mt-10 w-fit flex flex-col">
                  <p className="">{report?.task_assigned_to_name}</p>
                  <p className="text-gray-600">Auditor</p>
                </div>
              </div>

              <div className="flex mt-4">
                {report?.task_status === 'Pending Review' ?
                  <button className="ml-auto btn disable" disabled={!hasPermissions([512])} onClick={() => updateTaskStatus(report?.id, report?.task_id)}>Accept</button>
                  : null}
              </div>

            </div>
            <div className="border-card p-8 mt-4">
              <p className="font-semibold text-lg">Evidences</p>
              <div className="mt-2 flex gap-2 flex-wrap w-full">
                {evidences.map((file, index) => {
                  return (
                    <div key={index} className="w-1/4" onClick={() => { setViewMediaModal(true); setMedia(file) }}>
                      {/* Handle Image Files */}
                      {file.type === "image/png" || file.type === "image/jpeg" ? (
                        <div className="h-48 w-full rounded-lg overflow-hidden">
                          <div
                            className="w-full h-full bg-cover bg-center cursor-pointer hover:scale-110"
                            style={{ backgroundImage: `url(${file.url})` }}>
                          </div>
                        </div>
                      ) : null}

                      {/* Handle Video Files */}
                      {file.type === "video/mp4" ? (
                        <div className="h-48 w-full rounded-lg overflow-hidden bg-black">
                          <video autoPlay loop src={file.url} className="w-full h-full hover:scale-110">
                          </video>
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>

            </div>
            <Modal show={viewMediaModal} onClose={() => setViewMediaModal(false)} name="Preview">
              {
                !(media?.type === 'image/png' || media?.type === 'image/jpeg') ? null :
                  <div className="w-full flex flex-col items-center">
                    <img src={media?.url} alt={media?.ur} className="rounded-lg h-96 w-fit" />
                    <p className="text-nowrap italic group-hover:underline mt-2">
                      {media?.name} ({(media?.size / 1024 / 1024).toFixed(2)} MB)
                    </p>
                  </div>
              }
              {
                !(media?.type === 'video/mp4') ? null :
                  <div>
                    <video controls src={media?.url} type="video/mp4" className="rounded-lg" />
                    <p className="text-nowrap italic group-hover:underline mt-2">
                      {media?.name} ({(media?.size / 1024 / 1024).toFixed(2)} MB)
                    </p>
                  </div>
              }
            </Modal>
          </div>
        }
      </Layout>
    </AuthenticatedLayout>
  )
}

export default ReportsView;
