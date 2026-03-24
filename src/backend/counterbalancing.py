"""
Counterbalancing algorithms for experimental design.

Implements Latin square and other counterbalancing methods for
within-subject experimental designs.
"""

import random
from typing import List, Optional


def generate_latin_square(n: int) -> List[List[int]]:
    """
    Generate an n×n Latin square for counterbalancing.
    
    A Latin square is an n×n array filled with n different symbols,
    each occurring exactly once in each row and exactly once in each column.
    
    Args:
        n: The size of the square (number of conditions)
        
    Returns:
        A 2D list representing the Latin square where each value is a condition index (0 to n-1)
    """
    if n <= 0:
        return []
    
    # Create a balanced Latin square using the standard construction method
    # First row: 0, 1, 2, ..., n-1
    # Each subsequent row is rotated by 1
    square = []
    for i in range(n):
        row = [(i + j) % n for j in range(n)]
        square.append(row)
    
    return square


def generate_balanced_latin_square(n: int) -> List[List[int]]:
    """
    Generate a balanced Latin square that controls for first-order carryover effects.
    
    Uses the Williams design for even n, or a modified approach for odd n.
    
    Args:
        n: The number of conditions
        
    Returns:
        A balanced Latin square as a 2D list
    """
    if n <= 0:
        return []
    
    if n == 1:
        return [[0]]
    
    if n == 2:
        return [[0, 1], [1, 0]]
    
    # Williams design for balanced Latin squares
    square = []
    
    for i in range(n):
        row = []
        for j in range(n):
            if j % 2 == 0:
                row.append((i + j // 2) % n)
            else:
                row.append((n - 1 - j // 2 + i) % n)
        square.append(row)
    
    # For odd n, we need to double the square (mirror it)
    if n % 2 == 1:
        for i in range(n):
            mirrored_row = [n - 1 - x for x in square[i]]
            square.append(mirrored_row)
    
    return square


def assign_condition_order(
    participant_number: int,
    conditions: List[str],
    method: str = "latin_square",
    seed: Optional[int] = None
) -> List[str]:
    """
    Assign condition order to a participant based on their sequence number.
    
    Args:
        participant_number: The participant's position in the study (0-indexed)
        conditions: List of condition names/IDs
        method: Counterbalancing method ("latin_square", "balanced_latin_square", "random")
        seed: Optional random seed for reproducibility
        
    Returns:
        List of conditions in the assigned order for this participant
    """
    n = len(conditions)
    
    if n == 0:
        return []
    
    if n == 1:
        return conditions.copy()
    
    if method == "random":
        if seed is not None:
            random.seed(seed + participant_number)
        shuffled = conditions.copy()
        random.shuffle(shuffled)
        return shuffled
    
    elif method == "balanced_latin_square":
        square = generate_balanced_latin_square(n)
        row_index = participant_number % len(square)
        order_indices = square[row_index]
        return [conditions[i] for i in order_indices]
    
    else:  # Default to latin_square
        square = generate_latin_square(n)
        row_index = participant_number % n
        order_indices = square[row_index]
        return [conditions[i] for i in order_indices]


def get_group_assignment(
    participant_number: int,
    num_groups: int,
    method: str = "sequential"
) -> int:
    """
    Assign a participant to a group for between-subject designs.
    
    Args:
        participant_number: The participant's position in the study (0-indexed)
        num_groups: Number of experimental groups
        method: Assignment method ("sequential", "random")
        
    Returns:
        Group index (0 to num_groups-1)
    """
    if num_groups <= 0:
        return 0
    
    if method == "random":
        return random.randint(0, num_groups - 1)
    
    # Sequential assignment ensures equal distribution
    return participant_number % num_groups


def generate_completion_code(study_id: int, participant_id: int) -> str:
    """
    Generate a unique completion code for Prolific/MTurk verification.
    
    Args:
        study_id: The study ID
        participant_id: The participant ID
        
    Returns:
        A completion code string
    """
    import hashlib
    import time
    
    # Create a unique but verifiable code
    data = f"{study_id}-{participant_id}-{int(time.time())}"
    hash_obj = hashlib.sha256(data.encode())
    code = hash_obj.hexdigest()[:8].upper()
    
    return f"UXLAB-{code}"
