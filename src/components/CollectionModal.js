import React, { useState } from 'react';

const CollectionModal = ({ collections, show, onSelect, onClose, onCreateCollection }) => {
  const [selectedCollections, setSelectedCollections] = useState([]);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [error, setError] = useState(""); // State to hold error message

  if (!show) return null;

  // Filter out 'All Items' from the collections list
  const filteredCollections = collections.filter(
    (collection) => collection.name !== 'All Items'
  );

  const toggleCollectionSelection = (collectionName) => {
    setSelectedCollections((prevSelected) =>
      prevSelected.includes(collectionName)
        ? prevSelected.filter((name) => name !== collectionName)
        : [...prevSelected, collectionName]
    );
  };

  const handleConfirmSelection = () => {
    const allSelectedCollections = [...new Set([...selectedCollections, 'All Items'])];
    onSelect(allSelectedCollections); 
    setSelectedCollections([]);
    onClose();
  };

  const handleCreateNewCollection = () => {
    if (newCollectionName.trim() === "") {
      setError("Enter a name."); // Show error if name field is empty
      return;
    }

    if (collections.some((collection) => collection.name === newCollectionName.trim())) {
      setError("A collection with this name already exists.");
      return;
    }

    setError(""); // Clear any previous error
    onCreateCollection(newCollectionName.trim());
    setSelectedCollections((prevSelected) => [...prevSelected, newCollectionName.trim()]);
    setNewCollectionName("");
  };

  return (
    <div
      className="modal-overlay"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
      }}
    >
      <div
        className="modal-content"
        style={{
          background: 'white',
          padding: '10px',
          borderRadius: '10px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          width: '300px',
          maxHeight: '80%',
          overflowY: 'auto',
        }}
      >
        <h4 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>Select or Create a Collection</h4>

        <input
          type="text"
          value={newCollectionName}
          onChange={(e) => {
            setNewCollectionName(e.target.value);
            setError(""); // Clear error on input change
          }}
          placeholder="New Collection Name"
          style={{
            width: 'calc(100% - 20px)',
            padding: '8px',
            marginTop: '10px',
            fontSize: '14px',
            borderRadius: '4px',
            border: '1px solid #ccc',
          }}
        />
        <button
          onClick={handleCreateNewCollection}
          style={{
            marginTop: '10px',
            padding: '6px 12px',
            fontSize: '12px',
            backgroundColor: 'rgb(138, 44, 44)',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Create
        </button>

        {/* Display error message if there’s an error */}
        {error && (
          <p style={{ color: 'red', fontSize: '12px', marginTop: '5px' }}>{error}</p>
        )}

        <ul style={{ listStyle: 'none', padding: 0, margin: '10px 0' }}>
          {filteredCollections.map((collection) => (
            <li key={collection.id} style={{ marginBottom: '5px' }}>
              <button
                onClick={() => toggleCollectionSelection(collection.name)}
                style={{
                  width: '100%',
                  padding: '6px',
                  textAlign: 'left',
                  fontSize: '14px',
                  backgroundColor: selectedCollections.includes(collection.name)
                    ? '#d6961f'
                    : 'white',
                  color: selectedCollections.includes(collection.name)
                    ? 'black'
                    : 'black',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  transition: 'background-color 0.3s',
                }}
              >
                {collection.name}
              </button>
            </li>
          ))}
        </ul>

        <button
          onClick={handleConfirmSelection}
          disabled={selectedCollections.length === 0}
          style={{
            marginTop: '10px',
            padding: '6px 12px',
            fontSize: '12px',
            backgroundColor: selectedCollections.length === 0 ? '#eee' : 'rgb(138, 44, 44)',
            color: selectedCollections.length === 0 ? '#888' : 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: selectedCollections.length === 0 ? 'not-allowed' : 'pointer',
          }}
        >
          Add
        </button>
        <button
          onClick={() => {
            setSelectedCollections([]);
            onClose();
          }}
          style={{
            marginTop: '10px',
            padding: '6px 12px', 
            margin: '5px',
            fontSize: '12px',
            backgroundColor: 'rgb(138, 44, 44)',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default CollectionModal;
