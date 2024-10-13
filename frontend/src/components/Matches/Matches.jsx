import styles from './Matches.module.css';

const Matches = ({ urls }) => {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Matches</h1>
      {urls.length > 0 ? (
        <div className={styles.links}>
          <p className={styles.subhead}>{urls.length} link(s) found:</p>
          <ul className={styles.linkList}>
            {urls.map((url, index) => (
              <li key={index} className={styles.link}>
                <a className={styles.linkName} href={url} target="_blank" rel="noopener noreferrer">
                  {url}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p>No matches found.</p>
      )}
    </div>
  );
};

export default Matches;