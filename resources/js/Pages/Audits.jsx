import { useStateContext } from '@/context/contextProvider';
import { gradients } from "@/Constants/themes";
import AuditTaskCard from '@/Components/cards/AuditTaskCard';
import AuditorLayout from '@/Layouts/AuditorLayout';
import { useState, useEffect } from 'react';
import Modal from '@/Components/Modal';
import { handleInputChange } from '@/functions/handleInputChange';
import { dateFormatShort } from '@/Constants/options';
import { auditTasks } from '@/Constants/auditTasks';
import { auditTaskStatus } from '@/functions/status';
import { TbPlus } from 'react-icons/tb';
import { dateTimeFormatLong } from '@/Constants/options';
import { TbUserEdit } from 'react-icons/tb';

export default function Audits({ auth }) {
  const { theme } = useStateContext();
  const [openCreateTaskModal, setOpenCreateTaskModal] = useState(false);

  const [createTaskFormData, setCreateTaskFormData] = useState({
    title: '',
    type: '',
    user_id: null,
    description: '',
  });

  const [users, setUsers] = useState([]);
  const fetchUsers = async () => {
    try {
      const response = await axios.get('/user/get');
      setUsers(response.data);
    } catch (error) {
      toast.error(error);
    }
  }

  const [tasks, setTasks] = useState([]);
  const fetchTasks = async () => {
    try {
      const response = await axios.get('/audit/task/get');
      setTasks(response.data);
    } catch (error) {
      toast.error(error);
    }
  }

  useEffect(() => {
    fetchUsers();
    fetchTasks();
  }, [])

  const handleCreateTaskSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      type: createTaskFormData.type,
      title: createTaskFormData.title === '' ? `${new Date().toLocaleString(undefined, dateFormatShort)} | ${createTaskFormData.type}` : createTaskFormData.title,
      description: createTaskFormData.description,
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

  return (
    <AuthenticatedLayout
      user={auth.user}
    >
      <Head title="Audits" />
      <AuditorLayout user={auth.user} header={<h2 className="header" style={{ color: theme.text }}>Audits</h2>}>
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
                  className='border-card w-full mt-8'
                  placeholder={createTaskFormData.type === '' ? 'Title' : `Title: ${new Date().toLocaleString(undefined, dateFormatShort)} | ${createTaskFormData.type}`}
                  value={createTaskFormData.title}
                  onChange={(e) => handleInputChange(e, setCreateTaskFormData)}
                />

                <textarea name="description" id="description" className='resize-none w-full border-card mt-4' placeholder='Description' rows={6} value={createTaskFormData.description} onChange={(e) => handleInputChange(e, setCreateTaskFormData)} />
                <p className='italic text-sm my-4 mx-2'>
                  {createTaskFormData.type && auditTasks.find(task => task.name === createTaskFormData.type).desc || 'Please select task'}
                </p>

                <button className='border-card'>Create Task</button>
              </form>
            </div>
          </Modal>

          <Modal show={openViewTaskModal} onClose={() => setOpenViewTaskModal(false)}>
            <div className='p-4 h-96 flex flex-col'>
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
              <p className='mt-4 text-gray-500 '>{selectedTask?.description}</p>
              <div className='bg-gray-100 border-card p-2 mt-auto relative flex items-center mb-4'>
                  <p>No Auditor Assigned yet</p>
                  <button className='absolute right-4 text-blue-600'><TbUserEdit size={22}/></button>
              </div>

              {
                selectedTask?.status === 'Pending' ? 
                <button className='border-card font-medium bg-red-100 text-red-600' onClick={()=>handleDeleteTask(selectedTask?.id)}>Delete</button> :
                <button className='border-card font-medium bg-red-100 text-red-600'>Cancel</button>
              }
            </div>
          </Modal>
        </div>
      </AuditorLayout>
    </AuthenticatedLayout>
  );
}
