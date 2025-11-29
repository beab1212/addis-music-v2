import asyncio
from workers.embedding_worker import embedding_worker


async def main():
    """
    Main function that coordinates the execution of embedding tasks.

    This function gathers and runs multiple asynchronous tasks concurrently, 
    including the metadata embedding worker and the sonic embedding worker.
    It waits for all tasks to complete before exiting.

    Tasks:
        - `embedding_worker`: Handles the creation and storage of embeddings.
    It leverages asyncio to run these tasks concurrently for improved efficiency.

    Returns:
        None
    """
    # Define the tasks to be executed concurrently
    tasks = [
        embedding_worker(),
    ]
    # Wait for all tasks to complete and handle them concurrently
    await asyncio.gather(*tasks)


if __name__ == "__main__":
    """
    This checks if the script is being run directly and then runs the `main` function 
    using asyncio to handle asynchronous execution of embedding workers.
    """
    # Run the main function using asyncio
    asyncio.run(main())
