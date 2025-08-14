function gravatarUrl(hash, size = 36) {
    const defaultImg = 'retro';
    if (!hash) {
        return `https://gravatar.com/avatar/?s=${size}&d=${defaultImg}`;
    }
    return `https://gravatar.com/avatar/${hash}?s=${size}&d=${defaultImg}`;
}

module.exports = { gravatarUrl }