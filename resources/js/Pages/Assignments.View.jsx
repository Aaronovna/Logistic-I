import { useState, useEffect } from "react";
import { usePage } from "@inertiajs/react";
import { router } from "@inertiajs/react";
import { useStateContext } from "@/context/contextProvider";

import AuditLayout from "@/Layouts/AuditLayout";
import { auditTaskStatus } from "@/Constants/status";
import { handleInputChange } from "@/functions/handleInputChange";
import { dateFormatLong } from "@/Constants/options";

import { TbCloudUpload } from "react-icons/tb";
import { TbX } from "react-icons/tb";

const AssignmentsView = ({ auth }) => {
  if (!hasAccess(auth.user.type, [2050, 2051, 2054])) {
    return (
      <Unauthorized />
    )
  }

  const { theme } = useStateContext();
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
      setTask(response.data);
    } catch (error) {
      console.error("Error fetching task:", error);
    } finally {
      setLoading(false); // Stop loading
    }
  };

  useEffect(() => {
    fetchAssignment(id);
  }, []);

  const handleAccept = async (id) => {
    const payload = {
      status: 'In Progress'
    };

    try {
      const response = await axios.patch(`/audit/task/update/${id}`, payload)
      fetchInfrastructure();
    } catch (error) {

    }
  }

  const [files, setFiles] = useState([]);  // Store selected files

  const handleFileChange = (event) => {
    setFiles([...files, ...event.target.files]); // Append new files to the list
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

    // Ensure reportFormData is populated before file upload
    if (!reportFormData.location || !reportFormData.details || !reportFormData.final_comment) {
      alert("Please fill in all required fields before uploading files.");
      return;
    }

    // Ensure files are selected before uploading
    if (files.length === 0) {
      alert("Please select files first.");
      return;
    }

    const formData = new FormData();
    files.forEach(file => formData.append("files[]", file)); // Append multiple files

    try {
      // Upload files first
      const response = await axios.post("/file/store", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Collect file IDs (or paths) from the response and update reportFormData
      const uploadedFiles = response.data.files; // Assuming this is the response format

      // Collect file IDs (or paths) from the response and update reportFormData
      const fileIds = uploadedFiles.map(file => file.id);
      console.log(fileIds);

      const reportPayload = {
        location: reportFormData.location,
        details: reportFormData.details,
        final_comment: reportFormData.final_comment,
        task_id: reportFormData.task_id,
        review_status: 'Pending Review',
        files: JSON.stringify(fileIds),
      }

      setFiles([]); // Clear selected files after upload

      // Send report form data (with populated file_ids)
      const reportResponse = await axios.post('/audit/report/create', reportPayload);

      // If the report creation is successful, update the task status
      if (reportResponse.status === 200) {
        const payload = {
          status: 'Pending Review'
        };

        try {
          const updateResponse = await axios.patch(`/audit/task/update/${id}`, payload);
        } catch (updateError) {
          console.error("Error updating task status:", updateError);
        }
      }
    } catch (error) {
      console.error("Error uploading files or creating report:", error);
    }
  };

  const [report, setReport] = useState();
  const fetchReport = async (id) => {
    try {
      const response = await axios.get(`/audit/report/get/by/task/${id}`);

      // If report is found, set it
      if (response.status === 200) {
        setReport(response.data);
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

  return (
    <AuthenticatedLayout user={auth.user}>
      <Head title="My Tasks" />
      <AuditLayout user={auth.user}
        header={<h2 style={{ color: theme.text }}>
          <span className='header hover:underline cursor-pointer' onClick={handleClick1}>{`Assignments`}</span>
          <span className='header'>{' > '}</span>
          <span className='header hover:underline cursor-pointer' onClick={() => handleClick2(id)}>{`View`}</span>
        </h2>}
      >
        <div className="content">
          <div className="border-card p-8 relative">
            <p className={`absolute right-0 mr-8 rounded-md py-1 px-2 h-fit w-fit ${auditTaskStatus.find(status => status.name === task?.status)?.color}`}>{task?.status}</p>
            <p className="font-medium text-lg">{new Date(task?.created_at).toLocaleString(undefined, dateFormatLong)}</p>
            <p className="mt-8 font-semibold">{task?.type}</p>
            <p className="text-gray-600">Assigned by {task?.assigned_by_name}</p>
            <p className="mt-8 font-semibold">{task?.title}</p>
            <p className="font-medium">Scope: {task?.scope}</p>
            <p className="mt-4 text-gray-600">{task?.description}</p>
            {
              task?.status !== 'Pending' ?
                null :
                <div className="flex">
                  <button disabled={task?.status !== 'Pending' ? true : false} onClick={() => handleAccept(task?.id)} className="ml-auto border-card">Accept</button>
                </div>
            }
          </div>

          {
            task?.status === "Pending" ?
              null :
              <div className="border-card p-8 mt-4">
                <div className="flex">
                  {
                    task?.status === "In Progress" ?
                      <p className="font-semibold text-xl" >Create Report</p> :
                      <p className="font-semibold text-xl" >Summary Report</p>
                  }
                  <p className="ml-auto font-medium">{new Date().toLocaleDateString()}</p>
                </div>
                <form className="flex flex-col mt-4" onSubmit={handleReportSubmit}>
                  <div className="flex gap-2">
                    <input type="text" name="type" id="type" readOnly value={task?.type || ''} className="text-gray-600 font-medium flex-1 cursor-not-allowed border-card" />
                    <input type="text" name="scope" id="scope" readOnly value={task?.scope || ''} className="text-gray-600 font-medium  flex-1 cursor-not-allowed border-card" />
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

                  <p className="mt-4 font-semibold text-xl">Evidences</p>
                  {
                    task?.status === "Pending Review" ?
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
                          className="hidden"
                        />
                        <label
                          htmlFor="file"
                          className="flex border-card cursor-pointer font-medium items-center gap-2 w-fit mt-2"
                        >
                          <TbCloudUpload size={20} />
                          Upload Files
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
                    task?.status === 'In Progress' ? <button type="submit" className="border-card w-fit ml-auto">Submit</button> : null
                  }
                </form>
              </div>
          }
        </div>
      </AuditLayout>
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