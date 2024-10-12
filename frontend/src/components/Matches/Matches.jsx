import styles from './Matches.module.css';

const Matches = ({ urls }) => {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Matches</h1>
      {urls.length > 0 ? (
        <div>
          <p>{urls.length} link(s) found:</p> {/*Displays the count of URLs */}
          <ul>
            {urls.map((url, index) => (
              <li key={index}>
                <a href={url} target="_blank" rel="noopener noreferrer">
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
