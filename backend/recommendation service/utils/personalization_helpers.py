"""
Utility functions for vector averaging and weighted blending.

This module provides:
- `average_vector` for computing the element-wise average of a list of vectors.
- `weighted_blend` for computing a weighted linear combination of up to three vectors.
"""

from typing import List, Optional


def average_vector(vectors: List[List[float]]) -> List[float]:
    """
    Compute the element-wise average of a list of numeric vectors.

    Args:
        vectors (List[List[float]]): 
            A list of vectors (lists of floats). All vectors must have the same length.

    Returns:
        List[float]: 
            A vector where each element is the average of the corresponding elements
            of the input vectors.  
            If `vectors` is empty, an empty list is returned.

    Example:
        >>> average_vector([[1, 2], [3, 4], [5, 6]])
        [3.0, 4.0]
    """
    if not vectors:
        return []
    
    # remove None vectors
    vectors = [vec for vec in vectors if vec is not None and len(vec) > 0]
    if not vectors:
        return []

    dim: int = len(vectors[0])
    total: List[float] = [0.0] * dim

    for vec in vectors:
        for i in range(dim):
            total[i] += vec[i]

    return [val / len(vectors) for val in total]


def weighted_blend(
    a: Optional[List[float]] = None,
    b: Optional[List[float]] = None,
    c: Optional[List[float]] = None,
    w1: float = 0.0,
    w2: float = 0.0,
    w3: float = 0.0
) -> List[float]:
    """
    Compute the weighted linear combination of up to three vectors.

    Each output element is computed as:
        result[i] = w1 * a[i] + w2 * b[i] + w3 * c[i]

    - If fewer than three vectors are provided, only the provided ones are used.
    - Vectors may differ in length; missing values are treated as 0.
    - The result length is equal to the longest provided vector.

    Args:
        a (Optional[List[float]]): First vector (default None).
        b (Optional[List[float]]): Second vector (default None).
        c (Optional[List[float]]): Third vector (default None).
        w1 (float): Weight for vector `a`.
        w2 (float): Weight for vector `b`.
        w3 (float): Weight for vector `c`.

    Returns:
        List[float]: The resulting weighted vector.

    Example:
        >>> weighted_blend([1, 2], [3, 4], None, 0.5, 0.5, 0.0)
        [2.0, 3.0]
    """
    vectors = [a or [], b or [], c or []]
    weights = [w1, w2, w3]

    # Determine the maximum length of the vectors
    max_len = max(len(v) for v in vectors)

    result: List[float] = []
    for i in range(max_len):
        value = sum(
            weight * vec[i] if i < len(vec) else 0.0
            for vec, weight in zip(vectors, weights)
        )
        result.append(value)

    return result
