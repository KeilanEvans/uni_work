import React, { useState } from 'react';
import logo from './eebay.svg';
import './App.css';
// Function to create Home page
function App() {
  const [isCreateBidModalOpen, setIsCreateBidModalOpen] = useState(false);
  const [isPlaceBidModalOpen, setIsPlaceBidModalOpen] = useState(false);

  const productsOnSale = [
    { id: 1, name: 'Laptop', price: '$999', description: 'High-performance laptop' },
    { id: 2, name: 'Phone', price: '$699', description: 'Latest model smartphone' },
    { id: 3, name: 'Headphones', price: '$199', description: 'Noise-cancelling headphones' },
    { id: 4, name: 'Watch', price: '$149', description: 'Smart watch with fitness tracking' },
  ];

  const openCreateBidModal = () => {
    setIsCreateBidModalOpen(true);
  };

  const closeCreateBidModal = () => {
    setIsCreateBidModalOpen(false);
  };

  const openPlaceBidModal = () => {
    setIsPlaceBidModalOpen(true);
  };

  const closePlaceBidModal = () => {
    setIsPlaceBidModalOpen(false);
  };

  return (
    <div className="App">
      <div className="App-spacer" />
      <img src={logo} className="App-logo" alt="logo" />

      <header className="App-header">
        <p>Welcome to e-Ebay!</p>
      </header>

      <h1>Sale of Stuff idk</h1>

      {/* Buttons above the table */}
      <div className="bottom-buttons-container">
        <button className="button" onClick={openCreateBidModal}>
          Create Bid
        </button>
        <button className="button" onClick={openPlaceBidModal}>
          Place Bid
        </button>
      </div>

      {/* Table displaying products */}
      <table className="App-table">
        <thead>
          <tr>
            <th>Product</th>
            <th>Price</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          {productsOnSale.map((product) => (
            <tr key={product.id}>
              <td>{product.name}</td>
              <td>{product.price}</td>
              <td>{product.description}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {isCreateBidModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={closeCreateBidModal}>&times;</span>
            <h2>Create a Bid</h2>
            <form>
              <label>
                Product:
                <select name="product">
                  {productsOnSale.map((product) => (
                    <option key={product.id} value={product.name}>{product.name}</option>
                  ))}
                </select>
              </label>
              <br />
              <label>
                Bid Amount:
                <input type="number" name="bidAmount" />
              </label>
              <br />
              <button type="submit" className="button">Submit Bid</button>
            </form>
          </div>
        </div>
      )}

      {isPlaceBidModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={closePlaceBidModal}>&times;</span>
            <h2>Place a Bid</h2>
            <form>
              <label>
                Product:
                <select name="product">
                  {productsOnSale.map((product) => (
                    <option key={product.id} value={product.name}>{product.name}</option>
                  ))}
                </select>
              </label>
              <br />
              <label>
                Bid Amount:
                <input type="number" name="bidAmount" />
              </label>
              <br />
              <button type="submit" className="button">Submit Bid</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;