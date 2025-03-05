import "./fullscreen.css";

/**
 * @param {{
 *   children: React.ReactNode,
 *   center?: boolean
 * }} props
 */
export const Fullscreen = (props: {
  children: React.ReactNode;
  center?: boolean;
}) => <div {...props} className={`fullscreen fullscreen--centered`} />;
