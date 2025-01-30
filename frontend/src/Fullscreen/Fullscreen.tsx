import './fullscreen.css';

/**
 * @param {{
 *   children: React.ReactNode,
 *   center?: boolean
 * }} props
 */
export const Fullscreen = (props) => (
    <div {...props}
        className={`fullscreen fullscreen--centered`}
    />
);