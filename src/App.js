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

  useEffect(function () {
    async function getFacts() {
      let { data: facts, error } = await supabase.from("facts").select("*");
      setFacts(facts);
    }
    getFacts();
  }, []);

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
        />
      ) : null}

      <main className="main">
        {/* Category filter */}
        <CategoryFilter />

        {/* Fact List */}
        <FactList facts={facts} />
      </main>
    </>
  );
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

function NewFactForm({ setFacts, setShowForm }) {
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

      // Create new fact object

      const newFact = {
        id: Math.round(Math.random() * 100000),
        text: factText,
        source: factSource,
        category: factCategory,
        votesInteresting: 0,
        votesMindblowing: 0,
        votesFalse: 0,
        createdIn: new Date().getFullYear(),
      };
      // Add new fact to the UI, i.e. state

      setFacts((facts) => [newFact, ...facts]);

      // Reset input fields and close the form
      setFactText("");
      setFactSource("");
      setFactCategory("");
      setShowForm(false);
    }
  }

  return (
    <form className="fact-form" onSubmit={(e) => handleSubmit(e)}>
      {/* // <form className="fact-form" onSubmit={(e) => handleSubmit(e)}> */}
      <input
        type="text"
        placeholder="Share a fact with the world..."
        maxLength="200"
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

      <button className="btn btn-large">Post</button>
    </form>
  );
}

function CategoryFilter() {
  return (
    <aside>
      <ul>
        <li className="category">
          <button className="btn btn-all-categories">All</button>
        </li>
        {CATEGORIES.map((cat) => (
          <CategoryButtons key={cat.name} cat={cat} />
        ))}
      </ul>
    </aside>
  );
}

function CategoryButtons({ cat }) {
  return (
    <li className="category">
      <button
        className="btn btn-category"
        style={{ backgroundColor: cat.color }}
      >
        {cat.name}
      </button>
    </li>
  );
}

function FactList({ facts }) {
  return (
    <section>
      <ul className="facts-list">
        {/* Modularizing */}
        {facts.map((fact) => (
          <Fact key={fact.id} fact={fact} />
        ))}
      </ul>
      <p style={{ fontSize: "1.6rem" }}>
        There are {facts.length} facts in the database. Add your own!
      </p>
    </section>
  );
}

function Fact({ fact, setFacts }) {
  return (
    <li className="fact">
      <p>
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
        <button>👍 {fact.votesInteresting}</button>
        <button>🤯 {fact.votesMindblowing}</button>
        <button>😡 {fact.votesFalse}</button>
      </div>
    </li>
  );
}

export default App;
