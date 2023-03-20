type TitleProps = {
  collapsed: boolean;
};

export const Title: React.FC<TitleProps> = ({ collapsed }) => {
  return (
    <div>
      {collapsed ? (
        <div>A</div>
      ) : (
        <img
          src="/images/logo-white.svg"
          alt="Refine"
          style={{ width: "80%", margin: "0 auto", display: "block" }}
        />
      )}
    </div>
  );
};
