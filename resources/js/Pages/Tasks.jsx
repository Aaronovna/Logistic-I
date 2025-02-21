import { useState, useEffect } from 'react';
import { useStateContext } from '@/context/contextProvider';

import AuditLayout from '@/Layouts/AuditLayout';
import AuditTaskCard from '@/Components/cards/AuditTaskCard';
import { handleInputChange } from '@/functions/handleInputChange';
import { filterArray } from '@/functions/filterArray';
import { auditTaskStatus } from '@/Constants/status';
import { auditTasks } from '@/Constants/auditTasks';
import { dateFormatShort } from '@/Constants/options';
import { gradients } from "@/Constants/themes";
import { dateTimeFormatLong } from '@/Constants/options';
import { getStatusStep } from '@/Constants/status';

import { TbPlus } from 'react-icons/tb';
import axios from 'axios';
import Status from '@/Components/Status';
import updateStatus from '@/api/updateStatus';

const Tasks = ({ auth }) => {
  if (!hasAccess(auth.user.type, [2050, 2051, 2054, 2055])) {
    return (
      <Unauthorized />
    )
  }

  const { theme } = useStateContext();
  const [openCreateTaskModal, setOpenCreateTaskModal] = useState(false);

  const [createTaskFormData, setCreateTaskFormData] = useState({
    title: '',
    type: '',
    assigned_to: null,
    assigned_by: null,
    scope: '',
    startdate: new Date().toISOString().split('T')[0],
    deadline: '',/* new Date().toISOString().split('T')[0], */
    description: '',
  });

  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const fetchTasks = async () => {
    try {
      const response = await axios.get('/audit/task/get');
      setTasks(response.data);
    } catch (error) {
      toast.error(error);
    }
  }

  const [auditors, setAuditors] = useState([]);
  const fetchAuditors = async () => {
    try {
      const response = await axios.get('/user/get');
      setAuditors(filterArray(response.data, 'type', [2054, 2055]));
    } catch (error) {
      toast.error(error);
    }
  }

  useEffect(() => {
    fetchTasks();
    fetchAuditors();
  }, [])

  const handleCreateTaskSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      type: createTaskFormData.type,
      title: createTaskFormData.title === '' ? `${new Date().toLocaleString(undefined, dateFormatShort)} | ${createTaskFormData.type}` : createTaskFormData.title,
      description: createTaskFormData.description,
      scope: createTaskFormData.scope,
      startdate: new Date(createTaskFormData.startdate).toISOString().slice(0, 19).replace('T', ' '),
      deadline: new Date(createTaskFormData.deadline).toISOString().slice(0, 19).replace('T', ' '),
      assigned_to: '',
      assigned_by: auth.user.id,
    };

    try {
      const response = await axios.post('audit/task/create', payload)
      fetchTasks();
      setOpenCreateTaskModal(false);
    } catch (error) {

    }
  }

  const [openViewTaskModal, setOpenViewTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState();
  const handleClickTask = (data) => {
    setSelectedTask(data);
    setOpenViewTaskModal(true);
  }

  const handleDeleteTask = async (id) => {
    try {
      const response = axios.delete(`/audit/task/delete/${id}`);
      fetchTasks();
      setOpenViewTaskModal(false);
    } catch (error) {

    }
  }

  const handleCancelTask = async (id) => {
    const url = `/audit/task/update/${id}`;
    updateStatus(url, { status: 'Canceled' }, () => {
      fetchTasks();
      setOpenViewTaskModal(false);
    });
  }

  const [addTaskAuditorFormData, setAddTaskAuditorFormData] = useState({
    assigned_to: null,
  });

  const handleAddTaskAuditorSubmit = async (e, id) => {
    e.preventDefault();

    try {
      const response = await axios.patch(`/audit/task/update/${id}`, addTaskAuditorFormData);
      fetchTasks();
      setOpenViewTaskModal(false);
    } catch (error) {

    }
  }

  const handleAutoAddTaskAuditorSubmit = async (e, id) => {
    e.preventDefault();

    try {
      // Fetch the auditor ID from the API
      const { data: assigned_to } = await axios.get('/user/get/auditor/auto');

      // If no auditor is found, handle the error
      if (!assigned_to) {
        throw new Error('No available auditor found.');
      }

      // Update the task with the assigned auditor
      await axios.patch(`/audit/task/update/${id}`, { assigned_to });

      // Success feedback (optional)
      console.log(`Task ${id} successfully assigned to auditor ${assigned_to}`);
      toast.success('Task successfully assigned to auditor.');
      fetchTasks();
      setOpenViewTaskModal(false);
    } catch (error) {
      console.error('Error assigning task:', error.response?.data || error.message);
      toast.error(error.response?.data?.error || 'An error occurred while assigning the task.');
    }
  };

  const [activeFilter, setActiveFilter] = useState('No Filter');
  const filterTasks = (status) => {
    if (status === 'No Filter') {
      setFilteredTasks(tasks);
    } else {
      const filteredTasks = filterArray(tasks, 'status', [status]);
      setFilteredTasks(filteredTasks);
    }
    setActiveFilter(status);
  };

  useEffect(() => {
    filterTasks(activeFilter);
  }, [tasks]);

  return (
    <AuthenticatedLayout
      user={auth.user}
    >
      <Head title="Tasks" />
      <AuditLayout user={auth.user} header={<NavHeader headerName="Tasks"/>}>
        <div className="content relative">
          <button className='hidden fixed z-10 rounded-full p-3 bg-white bottom-8 shadow-lg right-8 items-center'>
            <TbPlus size={28} />
          </button>

          <div className='relative rounded-xl p-4 flex h-44 overflow-hidden shadow-xl' style={{ background: gradients.evening_night }}>
            <div className='absolute audit w-44 scale-125 top-4 right-10 h-full bg-no-repeat'></div>
            <div className='flex flex-col'>
              <p className='font-semibold text-3xl text-white tracking-wider'>Audit Board</p>
              <p className='font-medium text-2xl text-white mt-auto'>{tasks?.length === 0 ? 'No available task :)' : `${tasks?.length} needs an audit`}</p>
            </div>
          </div>

          <div className='flex flex-col w-full justify-between mt-8'>
            <div className='flex gap-2 mb-4'>
              {auditTaskStatus.map((status, index) => {
                return (
                  <span key={index} className={`cursor-pointer shadow-sm ${activeFilter === status.name ? 'scale-110 mx-1 shadow-xl' : null}`}>
                    <Status statusArray={auditTaskStatus} status={status.name} onClick={() => filterTasks(status.name)} />
                  </span>
                )
              })}
              <span>
                <span onClick={() => filterTasks('No Filter')}
                  className={`leading-normal whitespace-nowrap p-1 px-3 rounded-lg w-fit h-fit bg-gray-100 text-gray-600 cursor-pointer shadow-sm ${activeFilter === 'No Filter' ? 'scale-x-150 mx-1 shadow-xl' : null}`}>
                  No Filter
                </span>
              </span>
            </div>

            <div className='w-full flex mb-2 mt-2 items-end'>
              <div className='flex items-baseline ml-2'>
                <p className='font-semibold text-2xl'>Audit Tasks</p>
                <Link className='ml-2 text-sm hover:underline text-gray-600' href={route('tasks-history')}>History</Link>
              </div>
              <button
                className='ml-auto border-card font-medium'
                style={{ background: theme.accent, color: theme.background }}
                onClick={() => setOpenCreateTaskModal(true)}
              >
                Create Task
              </button>
            </div>
          </div>

          <div className='grid gap-4 grid-cols-2'>
            {
              filteredTasks && filteredTasks.map((task, index) => {
                return (
                  <AuditTaskCard data={task} key={index} onClick={() => handleClickTask(task)} />
                )
              })
            }
          </div>

          <Modal show={openCreateTaskModal} onClose={() => setOpenCreateTaskModal(false)} name='Create Task'>
            <div>
              <p className='modal-header'></p>
              <form onSubmit={handleCreateTaskSubmit}>
                <select name="type" id="type" className='border-card w-full' onChange={(e) => handleInputChange(e, setCreateTaskFormData)}>
                  <option value=''>Select Task</option>
                  {
                    auditTasks.map((task, index) => {
                      return (
                        <option value={task.name} key={index} className='text-sm'>{task.name}</option>
                      )
                    })
                  }
                </select>
                <div className='flex border-card p-1 mt-2 bg-white'>
                  <div className='w-1/2 flex items-center'>
                    <label htmlFor="startdate" className='px-2 text-nowrap text-gray-500'>Start Date:</label>
                    <input type="date" name="startdate" id="startdate"
                      className='w-full p-1 border-none'
                      value={createTaskFormData.startdate}
                      onChange={(e) => handleInputChange(e, setCreateTaskFormData)}
                    />
                  </div>
                  <div className='w-1/2 flex items-center'>
                    <label htmlFor="deadline" className='px-2 text-gray-500'>Deadline:</label>
                    <input type="date" name="deadline" id="deadline"
                      className={`w-full p-1 border-none ${createTaskFormData.deadline ? null : 'text-red-500'}`}
                      value={createTaskFormData.deadline}
                      onChange={(e) => handleInputChange(e, setCreateTaskFormData)}
                    />
                  </div>
                </div>
                <input type="text" name="title" id="title"
                  className='border-card w-full mt-6'
                  placeholder={createTaskFormData.type === '' ? 'Title' : `Title: ${new Date().toLocaleString(undefined, dateFormatShort)} | ${createTaskFormData.type}`}
                  value={createTaskFormData.title}
                  onChange={(e) => handleInputChange(e, setCreateTaskFormData)}
                />
                <div>
                  <input type="text" name="scope" id="scope"
                    className='border-card w-full mt-2'
                    placeholder="Scope"
                    value={createTaskFormData.scope}
                    onChange={(e) => handleInputChange(e, setCreateTaskFormData)}
                  />
                </div>

                <textarea name="description" id="description" className='resize-none w-full border-card mt-2' placeholder='Description' rows={6} value={createTaskFormData.description} onChange={(e) => handleInputChange(e, setCreateTaskFormData)} />
                <p className='italic text-sm my-4 mx-2 h-10'>
                  {createTaskFormData.type && auditTasks.find(task => task.name === createTaskFormData.type).desc || 'Please select task'}
                </p>

                <button className='border-card'>Create Task</button>
              </form>
            </div>
          </Modal>

          <Modal show={openViewTaskModal} onClose={() => setOpenViewTaskModal(false)} name={selectedTask?.type}>
            <div className='min-h-96 flex flex-col'>
              <div className='flex justify-between items-end mb-4'>
                <p className='text-gray-500 font-medium'>{new Date(selectedTask?.created_at).toLocaleString(undefined, dateTimeFormatLong)}</p>
                <p className={`
                    rounded-md py-1 px-2 h-fit w-fit font-medium shadow-sm 
                    ${auditTaskStatus.find(status => status.name === selectedTask?.status)?.color}
                `}>
                  {selectedTask?.status}
                </p>
              </div>
              <p className='font-medium text-lg'>{selectedTask?.title}</p>
              <p className='font-medium'>Scope: {selectedTask?.scope}</p>
              <p className='font-medium'>Deadline: {new Date(selectedTask?.deadline + 'Z').toLocaleString(undefined, dateTimeFormatLong)}</p>

              <textarea readOnly name="description" id="description"
                value={selectedTask?.description || ''} rows={5}
                className='mt-4 resize-none border-none bg-transparent text-gray-600'
              />

              <div className='bg-gray-100 border-card p-2 relative flex items-center mb-4 mt-auto'>
                {
                  selectedTask?.assigned_to ?
                    <div className='flex justify-between w-full'>
                      <p className={`font-medium`}>
                        <span className="font-medium">Assigned to </span>
                        {selectedTask?.assigned_to_name}
                      </p>
                      <p className={`font-medium text-gray-500`}>
                        <span className="font-medium">Assigned by </span>
                        {selectedTask?.assigned_by_name}
                      </p>
                    </div>
                    :
                    <div className='flex items-center'>
                      <select name="assigned_to" id="assigned_to" onChange={(e) => handleInputChange(e, setAddTaskAuditorFormData)}>
                        <option value={null}>Assign an Auditor</option>
                        {
                          auditors && auditors.map((auditor, index) => {
                            return (
                              <option value={auditor.id} key={index}>{auditor.name}</option>
                            )
                          })
                        }
                      </select>
                      {/* <button type='button' className='text-blue-600 px-2'><TbUserEdit size={22} /></button> */}
                    </div>
                }
              </div>
              {
                selectedTask && getStatusStep(auditTaskStatus, selectedTask?.status) === 1 &&
                <button className='border-card font-medium bg-red-100 text-red-600' onClick={() => handleDeleteTask(selectedTask?.id)}>Delete</button>
              }
              {
                selectedTask && (getStatusStep(auditTaskStatus, selectedTask?.status) === 2 || getStatusStep(auditTaskStatus, selectedTask?.status) === 3) &&
                <button className='border-card font-medium bg-red-100 text-red-600' onClick={() => handleCancelTask(selectedTask?.id)}>Cancel</button>
              }
              <div className='flex gap-2 w-full'>
                {
                  selectedTask?.assigned_to ? null :
                    <button className='border-card font-medium w-full bg-blue-100 text-blue-600 mt-2' onClick={(e) => handleAutoAddTaskAuditorSubmit(e, selectedTask?.id)}>Auto Assign Auditor</button>
                }
                {
                  selectedTask?.assigned_to ? null :
                    <button className='border-card font-medium w-full bg-blue-100 text-blue-600 mt-2' onClick={(e) => handleAddTaskAuditorSubmit(e, selectedTask?.id)}>Save</button>
                }
              </div>
            </div>
          </Modal>
        </div>
      </AuditLayout>
    </AuthenticatedLayout>
  );
}

export default Tasks;