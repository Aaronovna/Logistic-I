const Status = ({ statusArray = [], status = '', style = 1, className = undefined, onClick = () => { } }) => {
    let statusStyle;

    if (style === 1) {
        statusStyle = `leading-normal whitespace-nowrap p-1 px-3 rounded-lg w-fit h-fit ${className}`;
    }
    if (style === 2) {
        statusStyle = `leading-normal whitespace-nowrap p-1 px-3 rounded-full w-fit h-fit ${className}`;
    }

    return (
        <span onClick={onClick}
            className={`${statusStyle} ${statusArray.find(item => item.name === status)?.color}`}>
            {status}
        </span>
    )
}

export default Status;