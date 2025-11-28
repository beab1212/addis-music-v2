"""
Utility functions for vector averaging and weighted blending.

This module provides:
- `average_vector` for computing the element-wise average of a list of vectors.
- `weighted_blend` for computing a weighted linear combination of up to three vectors.
"""

from typing import List


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

    dim: int = len(vectors[0])
    total: List[float] = [0.0] * dim

    for vec in vectors:
        for i in range(dim):
            total[i] += vec[i]

    return [val / len(vectors) for val in total]


def weighted_blend(
    a: List[float],
    b: List[float],
    c: List[float],
    w1: float,
    w2: float,
    w3: float
) -> List[float]:
    """
    Compute the weighted linear combination of three vectors.

    Each output element is computed as:
        result[i] = w1 * a[i] + w2 * b[i] + w3 * c[i]

    Vectors may differ in length; missing values are treated as 0.

    Args:
        a (List[float]): First vector.
        b (List[float]): Second vector.
        c (List[float]): Third vector.
        w1 (float): Weight for vector `a`.
        w2 (float): Weight for vector `b`.
        w3 (float): Weight for vector `c`.

    Returns:
        List[float]:
            The resulting weighted vector.  
            Its length matches the length of `a`; any shorter vectors contribute
            0 beyond their length.

    Example:
        >>> weighted_blend([1, 2], [3, 4], [5, 6], 0.5, 0.3, 0.2)
        [2.6, 3.6]
    """
    dim: int = len(a)
    result: List[float] = []

    for i in range(dim):
        ai: float = a[i] if i < len(a) else 0.0
        bi: float = b[i] if i < len(b) else 0.0
        ci: float = c[i] if i < len(c) else 0.0
        result.append(w1 * ai + w2 * bi + w3 * ci)

    return result
