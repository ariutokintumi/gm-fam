import styles from "../styles/Home.module.css";


const LoadingAnimation: React.FC<{ text: string }> = ({ text }) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
      }}
    >
      <div className={styles.lds_ellipsis}>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
      {text}
    </div>
  );
};

export default LoadingAnimation;