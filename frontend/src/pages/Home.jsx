import React from 'react';
import ChatBox from '../components/ChatBox';

const Home = () => {
    return (
        <main style={{ padding: '0 2rem' }}>
            <div style={{ textAlign: 'center', margin: '2rem 0' }}>
                <h2>Strategic Insights at Your Fingertips</h2>
                <p style={{ color: '#888' }}>Ask about market trends, strategy, or data analysis.</p>
            </div>
            <ChatBox />
        </main>
    );
};

export default Home;
