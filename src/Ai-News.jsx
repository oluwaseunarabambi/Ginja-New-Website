import React, {useState, useEffect} from "react";
import './styles/Styles.css';
import { useSpeechSynthesis } from 'react-speech-kit';
import About from "./About";
import Contact from "./Contact";


const AIWebsite = () => {
    const [articles, setArticles] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterdArticles, setFilteredArticles] = useState([]);
    const [darkMode, setDarkMode] = useState(false); // state for dark mode
    const [sortBy, setSortBy] = useState('newest'); // Default sort b newest
    const [filterBy, setFilterBy] = useState(''); // Default no filter 
    const [currentPage, setCurrentPage] = useState('');
    const [itemsPerPage] = useState(10); // Change this to adjust the number of items per page

    const { speak } = useSpeechSynthesis();

    const [error, setError] = useState(null);

    useEffect(() => {
        // Fetch news articles from the API
        fetch('https://api.nytimes.com/svc/topstories/v2/world.json?api-key=UNfyrtbqwbManXET5x0Pb0Bke3UluwrE')
            .then(response => response.json())
            .then(data => {
                // Set the fetched articles to the state
                // Modify the structure of articles to include multimedia content
                console.log("API Response:", data);
                const modifiedArticles = data.results.map(article => ({
                    ...article,
                    multimedia: {
                        image: article.multimedia.length > 0 ? article.multimedia[0].url : null, // Assuming image URL is provided in urlToImage field
                        video: null,  // You can fetch video URLs from another source if available
                    }
                }));
                console.log("Modified Articles:", modifiedArticles);
                 setArticles(modifiedArticles);
            })     
            .catch(error => {
                setError(error.message);
            })
    }, []); // Empty dependency array ensures useEffect runs only after initial render

    const toggleDarkMode = () => {
        setDarkMode(!darkMode);
    };
    const speakText = (title, description) => {
        speak( { text: `${title} . ${description}`});
    };

    const handleSubmit = (event) => {
        event.preventDefault(); // Prevent the form submitting normally
        // Filter articles based on search term
        const filtered = articles.filter(article =>
            article.title.toLowerCase().includes(searchTerm)
        );
        console.log('Filtered Articles:', filtered); // log filtred articles to verify correctness
        setFilteredArticles(filtered);
        setCurrentPage(1); // Reset to the first page when performing a new search
    };

    const handleChange = (event) => {
        console.log('Search Term:', event.target.value);
        setSearchTerm(event.target.value.toLowerCase());
    };

    const handleSortChange = (event) => {
        // console.log('Sort By:', event.target.value);
        setSortBy(event.target.value);
    };

    const handleFilterChange = (event) => {
        setFilterBy(event.target.value);
    };
    // Change page
        const paginate = (pageNumber) => setCurrentPage(pageNumber);

    //Calculate the index of the first and last item to display on the current page
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = (searchTerm ? filterdArticles : articles).slice(indexOfFirstItem, indexOfLastItem);


    // Apply sorting and filtering to articles
    let sortedArticles = [...(searchTerm ? filterdArticles : articles)];
    if (sortBy === 'newest') {
        sortedArticles.sort((a, b) => new Date(b.published_date) - new Date(a.published_date));
    } else if (sortBy === 'oldest') {
        sortedArticles.sort((a, b) => new Date(a.published_date) - new Date(b.published_date));
    }

    if (filterBy) {
        sortedArticles = sortedArticles.filter(article => 
            article.section.toLowerCase() === filterBy.toLowerCase()
        );
    }

    const pageNumbers =[];
    for (let i =1; i <= Math.ceil((searchTerm ? filterdArticles.length : articles.length) / itemsPerPage); i++) {
        pageNumbers.push(i)
    }

    return (

        <div className={darkMode ? "dark-mode" : "light-mode"}> {/* Apply dark/light mode class */}
            <header>
                <h1>Ginja News Website</h1>
                <nav>
                    <ul>
                        <li><a href="#">Home</a></li>
                        <li><a href="#">About Us</a></li>
                        <li><a href="#">Contact</a></li>
                    </ul>
                </nav>
                <button onClick={toggleDarkMode}>
                    {darkMode ? "Switch to Light Mode" : "Switch to Dark Mode" }
                </button>
            </header>

            {error && (
                <div className="error-container">
                    <p>Error: {error}</p>
                    <button onClick={() => window.location.reload()}>Retry</button>
                </div>
            )}

            <section id="hero">
                <h2>Welcome to our Ginja News Website</h2>
                <p>Stay updated with the latest headlines from every Country </p>
                <form id="search-form" onSubmit={handleSubmit}>
                    <input type="text" id="search-input" name="search" value={searchTerm} onChange={handleChange} placeholder="Search News" />
                    <button type="submit">Search</button>
                </form>
                <div>
                     <label htmlFor="sort-select">Sort by:</label>
                     <select id="sort-select" value={sortBy} onChange={handleSortChange}>
                          <option value="newest">Newest</option>
                          <option value='oldest'>Oldest</option>
                     </select>
                     <label htmlFor="filter-select">Filter by section:</label>
                     <select id="filter-select" value={filterBy} onChange={handleFilterChange}>
                            <option value=" ">All</option>
                            <option value="world">World</option>
                            <option value="polictics">Politics</option>
                            <option value="sports">Sports</option>
                            <option value="business">Business</option>
                     </select>
                </div>
            </section>

            <section id="latest-headlines">
                <u><h2>Latest headline News from Around the World</h2></u> 
                <ul id="articles-list">
                    {currentItems.map((article, index) => (
                        <li key={index}>

                                <h3>
                                   <a href={article.url} target="_blank" rel="noopener noreferrer">{article.title}</a>
                                </h3>

                                {article.multimedia.image ? (
                                    <img src={article.multimedia.image} alt="Article Thumbnail" />
                                ) : (
                                    <div className="no-multimedia">Multimedia Not Available</div>
                                    
                                )}

                                {/* {article.multimedia.image && <img src={article.multimedia.image} alt="Article Thumbnail" />}
                                {article.multimedia.video && <video src={article.multimedia.video} controls />} */}

                                <p>{article.abstract}</p>

                                <button className="ReadArticleButton" onClick={ () => speak( { text: article.title + '. ' + article.abstract })}>
                                            Read Article
                                </button>

                                    {/* Add a console log to check article URLs */}
                                    {console.log("Article URL:", article.url)}
                        </li>
                    ))}
                </ul>
                <ul id="pagination">
                      {pageNumbers.map(number =>(
                           <li key={number} className={currentPage === number ? 'active' : ''}>
                                <button 
                                    onClick={ () => paginate(number)}
                                    aria-label={`Go to page ${number}`}
                                    aria-current={currentPage === number ? 'page' : null}

                                >
                                    {number}
                                </button>
                           </li>
                      ))}           
                </ul>
            </section>
            
            <About/>
            <Contact/>
            <footer>
                <p>&copy; {new Date().getFullYear()} Ginja Tech AI News Website</p>
            </footer>
        </div>

    );

};

export default AIWebsite;