import { useState, useEffect } from "react";
import { usePage } from "@inertiajs/react";
import { router } from "@inertiajs/react";
import Status from "@/Components/Status";
import useRole from "@/hooks/useRole";
import { auditTaskStatus, taskPriorityLevel } from "@/Constants/status";
import { handleInputChange } from "@/functions/handleInputChange";
import { dateFormatLong, dateTimeFormatShort } from "@/Constants/options";

import { TbCloudUpload } from "react-icons/tb";
import { TbX } from "react-icons/tb";
import useUpdateStatus from "@/api/useUpdateStatus";

const AssignmentsView = ({ auth }) => {
  const { hasAccess, getLayout, hasPermissions } = useRole();
  const Layout = getLayout(auth.user.type);

  const { updateStatus } = useUpdateStatus();
  const { props } = usePage();

  const { id } = props;

  const handleClick1 = () => {
    router.get('/assignments');
  };

  const handleClick2 = (id) => {
    router.get('/assignments/view', { id: id });
  };

  const [task, setTask] = useState();

  const [loading, setLoading] = useState(true); // Track loading state

  const fetchAssignment = async (id) => {
    setLoading(true); // Start loading
    try {
      const response = await axios.get(`/audit/task/get/${id}`);
      setTask(response.data.data);
    } catch (error) {
      toast.error(`${error.status} ${error.response.data.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignment(id);
  }, []);

  const handleAccept = async (id) => {
    const response = await updateStatus(`/audit/task/update/${id}`, { status: 'In Progress' });

    if (response && response.status === 200) {
      fetchAssignment(id);
      toast.success(response.data.message);
    }
  }

  const [files, setFiles] = useState([]);

  const handleFileChange = (event) => {
    setFiles([...files, ...event.target.files]);
  };
  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const [reportFormData, setReportFormData] = useState({
    location: '',
    details: '',
    final_comment: '',
    task_id: id,
    review_status: 'Reviewing',
    files: null,
  })

  const handleReportSubmit = async (e) => {
    e.preventDefault();

    if (!reportFormData.location || !reportFormData.details || !reportFormData.final_comment) {
      toast.error("Please fill in all required fields before uploading files.");
      return;
    }

    if (files.length === 0) {
      toast.error("Please select files first.");
      return;
    }

    const formData = new FormData();
    files.forEach(file => formData.append("files[]", file));

    try {
      const fileUploadResponse = await axios.post("/file/store", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (fileUploadResponse.status === 201) {
        const uploadedFiles = fileUploadResponse.data.data;
        const fileIds = uploadedFiles.map(file => file.id);

        const reportPayload = {
          location: reportFormData.location,
          details: reportFormData.details,
          final_comment: reportFormData.final_comment,
          task_id: reportFormData.task_id,
          review_status: 'Pending Review',
          files: JSON.stringify(fileIds),
        }

        const reportResponse = await axios.post('/audit/report/create', reportPayload);

        if (reportResponse.status === 200) {
          const payload = { status: 'Pending Review' };

          const updateResponse = await axios.patch(`/audit/task/update/${id}`, payload);

          if (updateResponse.status === 200) {
            fetchAssignment(id);
          }
        }
      }
    } catch (error) {
      toast.error(`${error?.status} ${error?.response?.data?.message}`);
    } finally {
      setFiles([]);
    }
  };

  const [report, setReport] = useState();
  const fetchReport = async (id) => {
    try {
      const response = await axios.get(`/audit/report/get/by/task/${id}`);

      // If report is found, set it
      if (response.status === 200) {
        setReport(response.data.data);
      }
    } catch (error) {
      // If there's a 404 error (report not found), handle it gracefully
      if (error.response && error.response.status === 404) {
        setReport(null); // Optionally set report to null or handle however you want
      } else {
        console.error("Error fetching report:", error);
      }
    }
  };


  useEffect(() => {
    if (task) {
      fetchReport(task.id);
    }
  }, [task])

  const [evidences, setEvidences] = useState([]);

  const fetchImages = async () => {
    try {
      const requests = JSON.parse(report.files).map(id => axios.get(`/file/get/${id}`));
      const responses = await Promise.all(requests);

      setEvidences(responses.map(response => response.data.data));
    } catch (error) {
      console.error("Error fetching images:", error);
    }
  };

  useEffect(() => {
    if (report) {
      fetchImages();
    }
  }, [report])

  return (
    <AuthenticatedLayout user={auth.user}>
      <Head title="My Tasks" />
      <Layout user={auth.user}
        header={<BreadCrumbsHeader
          headerNames={["Assignments", "View"]}
          onClickHandlers={[
            () => handleClick1(),
            () => handleClick2(id)
          ]} />
        }
      >
        {!hasAccess(auth.user.type, [2054, 2055]) ? <Unauthorized /> :
          <div className="content">
            <div className="border-card p-8">
              <div className="flex items-end">
                <p className="text-lg font-semibold">{task?.title}</p>
                <Status statusArray={auditTaskStatus} status={task?.status} className="ml-auto mr-2" />
                <Status statusArray={taskPriorityLevel} status={task?.priority} suffix="Priority" />
              </div>
              <p className="font-medium text-gray-600 mt-1">
                {`${new Date(task?.startdate).toLocaleString(undefined, dateTimeFormatShort)} - ${new Date(task?.deadline).toLocaleString(undefined, dateTimeFormatShort)}`}
              </p>
              <p className="mt-8 font-semibold">{task?.type}</p>
              <p className="text-gray-600 text-sm">Assigned by {task?.assigned_by_name}</p>
              <p className="font-medium mt-6">Scope: {task?.scope}</p>
              <p className="my-2 text-gray-600">{task?.description}</p>

              <div className="flex">
                {
                  task?.status !== 'Pending' ? null :
                    <button
                      disabled={task?.status !== 'Pending' || !hasPermissions([522])}
                      onClick={() => handleAccept(task?.id)}
                      className="ml-auto btn disable"
                    >Accept</button>
                }
              </div>
            </div>

            {task?.status === "Pending" || loading ? null :
              <div className="border-card p-8 mt-4">
                <div className="flex mb-6">
                  {
                    task?.status === "In Progress" ?
                      <p className="text-xl" >Create Report</p> :
                      <p className="text-xl" >Summary Report</p>
                  }
                  <p className="ml-auto font-meidum text-lg">{new Date().toLocaleDateString(undefined, dateFormatLong)}</p>
                </div>
                <form className="flex flex-col mt-4" onSubmit={handleReportSubmit}>
                  <div className="flex gap-2">
                    <input type="text" name="type" id="type" readOnly value={'Type: ' + task?.type || ''} className="text-gray-600 font-medium flex-1 cursor-not-allowed border-card" />
                    <input type="text" name="scope" id="scope" readOnly value={'Scope: ' + task?.scope || ''} className="text-gray-600 font-medium  flex-1 cursor-not-allowed border-card" />
                  </div>

                  <input
                    type="text" name="location" id="location" placeholder="Location"
                    className="border-card mt-4"
                    disabled={task?.status === "In Progress" ? false : true}
                    value={task?.status === "In Progress" ? reportFormData.location : report?.location || ''}
                    onChange={(e) => handleInputChange(e, setReportFormData)}
                  />
                  <textarea
                    name="details" id="details" rows="6" placeholder="Details"
                    className="border-card mt-2 resize-none"
                    disabled={task?.status === "In Progress" ? false : true}
                    value={task?.status === "In Progress" ? reportFormData.details : report?.details || ''}
                    onChange={(e) => handleInputChange(e, setReportFormData)}
                  />
                  <textarea
                    name="final_comment" id="final_comment" rows="3" placeholder="Final Comment"
                    className="border-card mt-2 resize-none"
                    disabled={task?.status === "In Progress" ? false : true}
                    value={task?.status === "In Progress" ? reportFormData.final_comment : report?.final_comment || ''}
                    onChange={(e) => handleInputChange(e, setReportFormData)}
                  />

                  <p className="my-2 text-xl">Evidences</p>
                  {
                    task?.status === "Pending Review" || task?.status === "Completed" ?
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
                      :
                      <div className="mb-4">
                        <input
                          type="file"
                          accept="image/*,video/*"
                          id="file"
                          onChange={handleFileChange}
                          className="hidden disable"
                          disabled={!hasPermissions([522])}
                        />
                        <label
                          htmlFor="file"
                          className="flex btn w-fit gap-2 disable"
                        >
                          <TbCloudUpload size={20} />
                          Upload File
                        </label>
                        <p className="mt-2 font-medium">Selected Files</p>
                        <ul>
                          {files.map((file, index) => (
                            <li key={index} className="flex italic ml-2">
                              {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                              <button type="button" onClick={() => removeFile(index)} className="text-red-600"><TbX /></button>
                            </li>
                          ))}
                        </ul>
                      </div>
                  }

                  {
                    task?.status === 'In Progress' ? <button type="submit" className="ml-auto btn disable" disabled={!hasPermissions([522])}>Submit</button> : null
                  }
                </form>
              </div>
            }
          </div>
        }
      </Layout>
    </AuthenticatedLayout>
  )
}

export default AssignmentsView;

/* const [uploadedFiles, setUploadedFiles] = useState([]); // Store uploaded files

useEffect(() => {
  axios.get("http://localhost:8000/files")
    .then(response => setUploadedFiles(response.data))
    .catch(error => console.error("Error fetching files:", error));
}, []); */

{/* <p className="mt-2 font-medium">Uploaded Files</p>
<ul>
  {uploadedFiles.map((file) => (
    <li key={file.id} className="w-fit">
      <a href={file.url} target="_blank" rel="noopener noreferrer">
        {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
        <img src={file.url} alt={file.url} className="w-32 border-card p-0"/>
      </a>
    </li>
  ))}
</ul> */}