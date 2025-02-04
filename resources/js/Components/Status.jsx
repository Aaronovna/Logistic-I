const Status = ({statusArray = [], status = '', className = ""}) => {
    return (
        <span className={`${className} ${statusArray.find(item => item.name === status)?.color}`}>
            {status}
        </span>
    )
}

export default Status;