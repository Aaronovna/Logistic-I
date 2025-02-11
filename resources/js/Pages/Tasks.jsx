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

import { TbPlus } from 'react-icons/tb';

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
    description: '',
  });

  const [tasks, setTasks] = useState([]);
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
      assigned_to: '',
      assigned_by: auth.user.id,
    };

    try {
      const response = await axios.post('audit/task/create', payload)
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
      const response = axios.delete(`/audit/task/delete/${id}`)
    } catch (error) {

    }
  }

  const handleCancelTask = async () => {

  }

  const [addTaskAuditorFormData, setAddTaskAuditorFormData] = useState({
    assigned_to: null,
  });

  const handleAddTaskAuditorSubmit = async (e, id) => {
    e.preventDefault();

    try {
      const response = await axios.patch(`/audit/task/update/${id}`, addTaskAuditorFormData);
    } catch (error) {

    }
  }

  return (
    <AuthenticatedLayout
      user={auth.user}
    >
      <Head title="Tasks" />
      <AuditLayout user={auth.user} header={<h2 className="header" style={{ color: theme.text }}>Tasks</h2>}>
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

          <div className='mt-8 border-card p-4'>
            <div className='flex w-full justify-between mb-4'>
              <p className='font-medium text-3xl' style={{ color: theme.text }}>Task</p>
              <button
                onClick={() => setOpenCreateTaskModal(true)}
                className='font-medium border-card'
                style={{ background: theme.accent, color: theme.background, borderColor: theme.border }}
              >
                Create Task
              </button>
            </div>
            <div className='flex gap-2 mb-4'>
              {auditTaskStatus.map((status, index) => {
                return (
                  <button key={index} className={`rounded-md py-1 px-2 h-fit w-fit font-medium shadow-sm whitespace-nowrap ${status.color}`}>{status.name}</button>
                )
              })}
            </div>
            <div className='grid gap-4 grid-cols-2'>
              {
                tasks && tasks.map((task, index) => {
                  return (
                    <AuditTaskCard data={task} key={index} onClick={() => handleClickTask(task)} />
                  )
                })
              }
            </div>
          </div>

          <Modal show={openCreateTaskModal} onClose={() => setOpenCreateTaskModal(false)}>
            <div className='p-4'>
              <p className='modal-header'>Create Task</p>
              <form onSubmit={handleCreateTaskSubmit}>
                <select name="type" id="type" className='border-card w-full' onChange={(e) => handleInputChange(e, setCreateTaskFormData)}>
                  <option value=''>Select Task</option>
                  {
                    auditTasks.map((task, index) => {
                      return (
                        <option value={task.name} key={index}>{task.name}</option>
                      )
                    })
                  }
                </select>

                <input type="text" name="title" id="title"
                  className='border-card w-full mt-2'
                  placeholder={createTaskFormData.type === '' ? 'Title' : `Title: ${new Date().toLocaleString(undefined, dateFormatShort)} | ${createTaskFormData.type}`}
                  value={createTaskFormData.title}
                  onChange={(e) => handleInputChange(e, setCreateTaskFormData)}
                />
                <input type="text" name="scope" id="scope"
                  className='border-card w-full mt-8'
                  placeholder="Scope"
                  value={createTaskFormData.scope}
                  onChange={(e) => handleInputChange(e, setCreateTaskFormData)}
                />

                <textarea name="description" id="description" className='resize-none w-full border-card mt-2' placeholder='Description' rows={6} value={createTaskFormData.description} onChange={(e) => handleInputChange(e, setCreateTaskFormData)} />
                <p className='italic text-sm my-4 mx-2'>
                  {createTaskFormData.type && auditTasks.find(task => task.name === createTaskFormData.type).desc || 'Please select task'}
                </p>

                <button className='border-card'>Create Task</button>
              </form>
            </div>
          </Modal>

          <Modal show={openViewTaskModal} onClose={() => setOpenViewTaskModal(false)}>
            <div className='p-4 min-h-96 flex flex-col'>
              <p className='modal-header'>{selectedTask?.type}</p>
              <div className='flex justify-between'>
                <p className='text-gray-500 font-medium mb-4'>{new Date(selectedTask?.created_at).toLocaleString(undefined, dateTimeFormatLong)}</p>
                <p className={`
                    rounded-md py-1 px-2 h-fit w-fit font-medium shadow-sm 
                    ${auditTaskStatus.find(status => status.name === selectedTask?.status)?.color}
                `}>
                  {selectedTask?.status}
                </p>
              </div>
              <p className='font-medium text-lg'>{selectedTask?.title}</p>
              <p className='font-medium'>Scope: {selectedTask?.scope}</p>
              <p className='text-gray-500 mt-4'>{selectedTask?.description}</p>
              <div className='bg-gray-100 border-card p-2 mt-20 relative flex items-center mb-4'>
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
                selectedTask?.status === 'Pending' ?
                  <button className='border-card font-medium bg-red-100 text-red-600' onClick={() => handleDeleteTask(selectedTask?.id)}>Delete</button> :
                  <button className='border-card font-medium bg-red-100 text-red-600'>Cancel</button>
              }
              {
                selectedTask?.assigned_to ?
                  null :
                  <button className='border-card font-medium bg-blue-100 text-blue-600 mt-2' onClick={(e) => handleAddTaskAuditorSubmit(e, selectedTask?.id)}>Save</button>
              }
            </div>
          </Modal>
        </div>
      </AuditLayout>
    </AuthenticatedLayout>
  );
}

export default Tasks;