import { useStateContext } from "@/context/contextProvider";

const Header = ({ headerName = "HeaderName" }) => {
  const { theme } = useStateContext();

  return (
    <h2 className="header" style={{ color: theme.text }}>
      {headerName}
    </h2>
  )
}

export default Header;

export const BreadCrumbsHeader = ({ headerNames = [""], onClickHandlers = [] }) => {
  const { theme } = useStateContext();

  return (
    <h2 style={{ color: theme.text }}>
      {headerNames.map((name, index) => (
        <span key={index}>
          <span
            className={`header ${onClickHandlers[index] ? "hover:underline cursor-pointer" : ""}`}
            onClick={onClickHandlers[index] || undefined}
          >
            {name}
          </span>
          {index < headerNames.length - 1 && <span className="header">{' > '}</span>}
        </span>
      ))}
    </h2>
  );
};
