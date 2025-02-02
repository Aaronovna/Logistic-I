import { useEffect, useState } from "react";
import { usePage } from "@inertiajs/react";
import { router } from "@inertiajs/react";
import { useStateContext } from "@/context/contextProvider";

import AuditLayout from "@/Layouts/AuditLayout";
import { dateTimeFormatShort } from "@/Constants/options";

const ReportsView = ({ auth }) => {
  if (!hasAccess(auth.user.type, [2050, 2051, 2054])) {
    return (
      <Unauthorized />
    )
  }

  const { props } = usePage();
  const { theme } = useStateContext();
  const { id } = props;

  const handleClick1 = () => {
    router.get('/reports');
  };

  const handleClick2 = () => {
    router.get('/reports/view', { id: id });
  };

  const [report, setReport] = useState();
  const fetchReport = async (id) => {
    try {
      const response = await axios.get(`/audit/report/get/${id}`);
      setReport(response.data);
    } catch (error) {

    }
  }

  const [evidences, setEvidences] = useState([]);

  const fetchImages = async () => {
    try {
      const requests = JSON.parse(report.files).map(id => axios.get(`/file/get/${id}`));
      const responses = await Promise.all(requests);

      setEvidences(responses.map(response => response.data));
    } catch (error) {
      console.error("Error fetching images:", error);
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
      // If the report creation is successful, update the task status
      if (reportResponse.status === 200) {
        const payload = {
          status: 'Completed'
        };

        try {
          const updateResponse = await axios.patch(`/audit/task/update/${tid}`, payload);
        } catch (updateError) {
          console.error("Error updating task status:", updateError);
        }

      }
    } catch (error) {

    }
  }

  return (
    <AuthenticatedLayout user={auth.user}>
      <Head title="View Peport" />
      <AuditLayout user={auth.user}
        header={<h2 style={{ color: theme.text }}>
          <span className='header hover:underline cursor-pointer' onClick={handleClick1}>{`Reports`}</span>
          <span className='header'>{' > '}</span>
          <span className='header hover:underline cursor-pointer' onClick={handleClick2}>{`View`}</span>
        </h2>}
      >
        <div className="content">
          <div className="border-card p-8">
            <p className="font-semibold text-xl">Task Details</p>
            <div className="flex justify-between mt-4">
              <p className="font-medium text-lg">{report?.task_title}</p>
              <p>Task created on: {new Date(report?.created_at).toLocaleString(undefined, dateTimeFormatShort)}</p>
            </div>
            <p>{report?.task_type}</p>
            <p className="mt-4">Scope: {report?.task_scope}</p>
            <p className="italic mt-2 text-gray-600">{report?.task_description}</p>

            <p className="font-semibold text-xl mt-8">Summary Report</p>
            <p>Submmited on: {new Date(report?.task_created_at).toLocaleString(undefined, dateTimeFormatShort)}</p>
            <p>Location: {report?.location}</p>
            <p className="mt-4 font-medium">Details</p>
            <p>{report?.details}</p>
            <p className="mt-2 font-medium">{report?.final_comment}</p>
            {
              report?.task_status === 'Pending Review' ? <div className="flex">
                <button className="ml-auto border-card" onClick={() => updateTaskStatus(report?.id, report?.task_id)}>Accept</button>
              </div> : null
            }

          </div>
          <div className="border-card p-8 mt-4">
            <p className="font-semibold text-xl">Evidences</p>
            <div className="mt-2">
              {evidences.map((file, index) => {
                return (
                  <div key={index} className="w-fit mb-2 text-sm group">
                    {/* Handle Image Files */}
                    {file.type === "image/png" || file.type === "image/jpeg" ? (
                      <div>
                        <a href={file.url} target="_blank" rel="noopener noreferrer">
                          <img src={file.url} alt={file.name} className="border-card p-0 w-72" />
                        </a>
                        <p className="text-nowrap italic group-hover:underline">
                          {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                        </p>
                      </div>
                    ) : null}

                    {/* Handle Video Files */}
                    {file.type === "video/mp4" ? (
                      <div>
                        <video controls className="w-72 border-card">
                          <source src={file.url} type="video/mp4" />
                          Your browser does not support the video tag.
                        </video>
                        <p className="text-nowrap italic group-hover:underline">
                          {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                        </p>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </AuditLayout>
    </AuthenticatedLayout>
  )
}

export default ReportsView;
