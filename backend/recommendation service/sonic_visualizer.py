# Using PCA (linear projection)
# PCA is fast and good for preserving global structure. You can reduce from 512 → 2 or 3 dimensions:


from libs.db.personalization_queries import get_all_tracks
import numpy as np
from sklearn.decomposition import PCA
import matplotlib.pyplot as plt
import plotly.express as px
import pandas as pd


def plot_2d_pca(tracks, n_components=2):
    """
    Perform PCA on track embeddings and plot a 2D scatter using matplotlib.

    Args:
        tracks (list): List of track dictionaries containing 'sonicEmbeddingVector' and 'title'.
        n_components (int): Number of PCA components (default 2 for 2D plot).
    """
    # Filter tracks with valid embeddings
    embeddings = [track['sonicEmbeddingVector'] for track in tracks if track.get('sonicEmbeddingVector') is not None]
    names = [track['title'] for track in tracks if track.get('sonicEmbeddingVector') is not None]
    X = np.array(embeddings)

    # Reduce dimensions using PCA
    pca = PCA(n_components=n_components)
    X_2d = pca.fit_transform(X)

    # Plot using matplotlib
    plt.figure(figsize=(8, 6))
    plt.scatter(X_2d[:, 0], X_2d[:, 1], c='blue')
    
    # Add track names as labels
    for i, name in enumerate(names):
        plt.text(X_2d[i, 0]+0.01, X_2d[i, 1]+0.01, name, fontsize=10)
    
    plt.xlabel("PC1")
    plt.ylabel("PC2")
    plt.title("2D PCA Projection of Track Embeddings")
    plt.grid(True)
    plt.show()


def plot_2d_pca_by_genre(tracks, n_components=2):
    """
    Plot 2D PCA of track embeddings using Plotly, coloring points by genre.

    :param tracks: List of track dictionaries containing 'sonicEmbeddingVector', 'title', and 'genre_name'.
    :param n_components: Number of PCA components (default 2 for 2D plot).
    """

    # Filter tracks with valid embeddings
    embeddings = [track['sonicEmbeddingVector'] for track in tracks if track.get('sonicEmbeddingVector') is not None]
    names = [track['title'] for track in tracks if track.get('sonicEmbeddingVector') is not None]
    genres = [track.get('genre_name', 'Unknown') for track in tracks if track.get('sonicEmbeddingVector') is not None]

    X = np.array(embeddings)

    # Reduce dimensions using PCA
    pca = PCA(n_components=n_components)
    X_2d = pca.fit_transform(X)

    # Create DataFrame for Plotly
    df = pd.DataFrame({
        'PC1': X_2d[:, 0],
        'PC2': X_2d[:, 1],
        'Track': names,
        'Genre': genres
    })

    # Plot using Plotly Express, coloring by genre
    fig = px.scatter(
        df, x='PC1', y='PC2', text='Track', color='Genre',
        title='2D PCA Projection of Track Embeddings by Genre',
        width=800, height=600
    )

    # Adjust text position to avoid overlap
    fig.update_traces(textposition='top center', marker=dict(size=8))
    fig.show()



def plot_3d_pca(tracks, n_components=3):
    """
    Perform PCA on track embeddings and plot an interactive 3D scatter using Plotly.

    Args:
        tracks (list): List of track dictionaries containing 'sonicEmbeddingVector' and 'title'.
        n_components (int): Number of PCA components (default 3 for 3D plot).
    """
    # Filter tracks with valid embeddings
    embeddings = [track['sonicEmbeddingVector'] for track in tracks if track.get('sonicEmbeddingVector') is not None]
    names = [track['title'] for track in tracks if track.get('sonicEmbeddingVector') is not None]
    X = np.array(embeddings)

    # Reduce dimensions using PCA
    pca = PCA(n_components=n_components)
    X_3d = pca.fit_transform(X)

    # Create DataFrame for Plotly
    df = pd.DataFrame({
        'PC1': X_3d[:, 0],
        'PC2': X_3d[:, 1],
        'PC3': X_3d[:, 2],
        'Track': names
    })

    # Plot interactive 3D scatter
    fig = px.scatter_3d(
        df, x='PC1', y='PC2', z='PC3', text='Track',
        title='3D PCA Projection of Track Embeddings',
        width=900, height=700
    )
    fig.update_traces(marker=dict(size=5, color='blue'))
    fig.show()


def plot_3d_pca_by_genre(tracks, n_components=3):
    """
    Perform PCA on track embeddings and plot an interactive 3D scatter using Plotly,
    coloring points by genre.

    Args:
        tracks (list): List of track dictionaries containing 'sonicEmbeddingVector', 'title', and 'genre_name'.
        n_components (int): Number of PCA components (default 3 for 3D plot).
    """
    # Filter tracks with valid embeddings
    embeddings = [track['sonicEmbeddingVector'] for track in tracks if track.get('sonicEmbeddingVector') is not None]
    names = [track['title'] for track in tracks if track.get('sonicEmbeddingVector') is not None]
    genres = [track.get('genre_name', 'Unknown') for track in tracks if track.get('sonicEmbeddingVector') is not None]
    
    X = np.array(embeddings)

    # Reduce dimensions using PCA
    pca = PCA(n_components=n_components)
    X_3d = pca.fit_transform(X)

    # Create DataFrame for Plotly
    df = pd.DataFrame({
        'PC1': X_3d[:, 0],
        'PC2': X_3d[:, 1],
        'PC3': X_3d[:, 2],
        'Track': names,
        'Genre': genres
    })

    # Plot interactive 3D scatter with color by genre
    fig = px.scatter_3d(
        df, x='PC1', y='PC2', z='PC3', text='Track', color='Genre',
        title='3D PCA Projection of Track Embeddings by Genre',
        width=900, height=700
    )

    fig.update_traces(marker=dict(size=5))
    fig.show()



tracks = get_all_tracks(60)
print(f"Fetched {len(tracks)} tracks for PCA visualization.")

# Plot 2D PCA
plot_2d_pca_by_genre(tracks)

# Plot 3D PCA
# plot_3d_pca(tracks)
# plot_3d_pca_by_genre(tracks)