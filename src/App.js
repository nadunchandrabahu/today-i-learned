import "./styles.css";
import "./queries.css";
import logo from "./logo.png";
import { useEffect, useState } from "react";

import supabase from "./supabase";

const CATEGORIES = [
  { name: "technology", color: "#3b82f6" },
  { name: "science", color: "#16a34a" },
  { name: "finance", color: "#ef4444" },
  { name: "society", color: "#eab308" },
  { name: "entertainment", color: "#db2777" },
  { name: "health", color: "#14b8a6" },
  { name: "history", color: "#f97316" },
  { name: "news", color: "#8b5cf6" },
];

// const initialFacts = [
//   {
//     id: 1,
//     text: "React is being developed by Meta (formerly facebook)",
//     source: "https://opensource.fb.com/",
//     category: "technology",
//     votesInteresting: 24,
//     votesMindblowing: 9,
//     votesFalse: 4,
//     createdIn: 2021,
//   },
//   {
//     id: 2,
//     text: "Millennial dads spend 3 times as much time with their kids than their fathers spent with them. In 1982, 43% of fathers had never changed a diaper. Today, that number is down to 3%",
//     source:
//       "https://www.mother.ly/parenting/millennial-dads-spend-more-time-with-their-kids",
//     category: "society",
//     votesInteresting: 11,
//     votesMindblowing: 2,
//     votesFalse: 0,
//     createdIn: 2019,
//   },
//   {
//     id: 3,
//     text: "Lisbon is the capital of Portugal",
//     source: "https://en.wikipedia.org/wiki/Lisbon",
//     category: "society",
//     votesInteresting: 8,
//     votesMindblowing: 3,
//     votesFalse: 1,
//     createdIn: 2015,
//   },
// ];

function isURL(string) {
  let url;
  try {
    url = new URL(string);
  } catch (_) {
    return false;
  }
  return url.protocol === "http:" || url.protocol === "https:";
}

function App() {
  let [showForm, setShowForm] = useState(false);
  const [facts, setFacts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  let [isUploading, setIsUploading] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(
    function () {
      setIsLoading(true);
      async function getFacts() {
        let query = supabase.from("facts").select("*");

        if (selectedCategory !== "all") {
          query = query.eq("category", selectedCategory);
        }

        let { data: facts, error } = await query
          .order("votesInteresting", { ascending: false })
          .limit(1000);

        if (!error) {
          setFacts(facts);
        } else {
          alert("There was a problem getting data.");
        }

        setIsLoading(false);
      }
      getFacts();
    },
    [selectedCategory]
  );

  return (
    <>
      {/* Header */}
      <Header setShowForm={setShowForm} showForm={showForm} />

      {/* New fact form */}
      {showForm ? (
        <NewFactForm
          facts={facts}
          setFacts={setFacts}
          setShowForm={setShowForm}
          isUploading={isUploading}
          setIsUploading={setIsUploading}
        />
      ) : null}

      <main className="main">
        {/* Category filter */}
        <CategoryFilter setSelectedCategory={setSelectedCategory} />
        {/* Fact List */}
        {isLoading ? (
          <Loader />
        ) : (
          <FactList
            facts={facts}
            setFacts={setFacts}
            isUploading={isUploading}
            setIsUploading={setIsUploading}
          />
        )}
      </main>
    </>
  );
}

function Loader() {
  return <p className="message">Loading...</p>;
}

function Header({ setShowForm, showForm }) {
  return (
    <header className="header">
      <div className="logo">
        <img src={logo} alt="Logo of App" className="logo-pic" />
        <h1>Today I Learned</h1>
      </div>

      <button
        className="btn btn-large btn-open"
        onClick={() => setShowForm((showForm) => !showForm)}
      >
        {showForm ? "Close" : "Share a fact"}
      </button>
    </header>
  );
}

function NewFactForm({ setFacts, setShowForm, isUploading, setIsUploading }) {
  let [factText, setFactText] = useState("");
  let [factSource, setFactSource] = useState();
  let [factCategory, setFactCategory] = useState("");

  function handleSubmit(e) {
    // Prevent default behavior

    e.preventDefault();

    if (
      factText &&
      isURL(factSource) &&
      factSource &&
      factCategory &&
      factText.length <= 200
    ) {
      // above line checks if fact details are valid

      // Upload fact to supabase

      async function insertRow() {
        setIsUploading(true);
        const { data: newFact, error } = await supabase
          .from("facts")
          .insert([
            { text: factText, source: factSource, category: factCategory },
          ])
          .select();
        setIsUploading(false);

        if (!error) {
          setFacts((facts) => [newFact[0], ...facts]);
        }
      }

      insertRow();

      // Reset input fields and close the form
      setFactText("");
      setFactSource("");
      setFactCategory("");
      setShowForm(false);
    } else {
      // Not posting fact due to some error.
      {
        alert(
          "Fact not posted. Please check: 1) If you wrote a fact 2) whether Source URL is valid and 3) you selected a Category."
        );
      }
    }
  }

  return (
    <form className="fact-form" onSubmit={(e) => handleSubmit(e)}>
      {/* // <form className="fact-form" onSubmit={(e) => handleSubmit(e)}> */}
      <input
        type="text"
        placeholder="Share a fact with the world..."
        maxLength="200"
        disabled={isUploading}
        value={factText}
        onChange={(e) => setFactText(e.target.value)}
      />
      <span>{200 - factText.length}</span>
      <input
        type="text"
        placeholder="Trustworthy source..."
        value={factSource}
        onChange={(e) => setFactSource(e.target.value)}
      />
      <select
        disabled={isUploading}
        value={factCategory}
        onChange={(e) => setFactCategory(e.target.value)}
      >
        <option value="">Choose category:</option>

        {CATEGORIES.map((cat) => (
          <option key={cat.name} value={cat.name}>
            {/* Converting category name to capitalized format */}
            {cat.name.charAt(0).toUpperCase() + cat.name.slice(1).toLowerCase()}
          </option>
        ))}
      </select>

      <button className="btn btn-large" disabled={isUploading}>
        Post
      </button>
    </form>
  );
}

function CategoryFilter({ setSelectedCategory }) {
  return (
    <aside>
      <ul className="category-buttons">
        <li className="category">
          <button
            className="btn btn-all-categories"
            onClick={(el) => setSelectedCategory("all")}
          >
            All
          </button>
        </li>
        {CATEGORIES.map((cat) => (
          <CategoryButtons
            key={cat.name}
            cat={cat}
            setSelectedCategory={setSelectedCategory}
          />
        ))}
      </ul>
    </aside>
  );
}

function CategoryButtons({ cat, setSelectedCategory }) {
  return (
    <li className="category">
      <button
        className="btn btn-category"
        style={{ backgroundColor: cat.color }}
        onClick={(el) => setSelectedCategory(cat.name)}
      >
        {cat.name}
      </button>
    </li>
  );
}

function FactList({ facts, setFacts, isUploading, setIsUploading }) {
  return (
    <section>
      <ul className="facts-list">
        {/* Breaking the code into parts here */}
        {facts.map((fact) => (
          <Fact
            key={fact.id}
            fact={fact}
            setFacts={setFacts}
            isUploading={isUploading}
            setIsUploading={setIsUploading}
          />
        ))}
      </ul>
      <p
        className={facts.length ? null : "message"}
        style={{ fontSize: "1.6rem" }}
      >
        {facts.length
          ? `There ${facts.length === 1 ? "is" : "are"} ${facts.length}  ${
              facts.length === 1 ? "fact" : "facts"
            } in the database. Add your own!`
          : "No Facts in this category yet, create the first one! ??????"}
      </p>
    </section>
  );
}

function Fact({ fact, setFacts, isUploading, setIsUploading }) {
  const isDisputed =
    fact.votesInteresting + fact.votesMindblowing < fact.votesFalse;

  // Vote1 is votesInteresting
  async function handleVote(voteType) {
    setIsUploading(true);
    const { data: updatedFact, error } = await supabase
      .from("facts")
      .update({ [voteType]: fact[voteType] + 1 })
      .eq("id", fact.id)
      .select();

    setIsUploading(false);

    if (!error) {
      setFacts((facts) =>
        facts.map((f) => (f.id === fact.id ? updatedFact[0] : f))
      );
    }
  }

  return (
    <li className="fact">
      <p>
        {isDisputed ? <span className="disputed">[???? DISPUTED]</span> : null}

        {fact.text}
        <a className="source" href={fact.source} target="_blank">
          (source)
        </a>
      </p>
      <span
        className="tag"
        style={{
          backgroundColor: CATEGORIES.find((el) => {
            return el.name === fact.category;
          }).color,
        }}
      >
        {fact.category}
      </span>
      <div className="vote-buttons">
        <button
          onClick={() => handleVote("votesInteresting")}
          disabled={isUploading}
        >
          ???? {fact.votesInteresting}
        </button>
        <button
          onClick={() => handleVote("votesMindblowing")}
          disabled={isUploading}
        >
          ???? {fact.votesMindblowing}
        </button>
        <button onClick={() => handleVote("votesFalse")} disabled={isUploading}>
          ???? {fact.votesFalse}
        </button>
      </div>
    </li>
  );
}

export default App;
