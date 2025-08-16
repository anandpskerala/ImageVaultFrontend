export const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

export const getPasswordStrength = (password: string) => {
    if (password.length === 0) return { strength: 0, text: '' };
    if (password.length < 8) return { strength: 25, text: 'Weak', color: 'bg-red-500' };

    let score = 25;
    if (/[A-Z]/.test(password)) score += 25; // Uppercase
    if (/[0-9]/.test(password)) score += 25; // Numbers
    if (/[^A-Za-z0-9]/.test(password)) score += 25; // Special characters

    if (score < 50) return { strength: score, text: 'Weak', color: 'bg-red-500' };
    if (score < 75) return { strength: score, text: 'Medium', color: 'bg-yellow-500' };
    return { strength: score, text: 'Strong', color: 'bg-green-500' };
};