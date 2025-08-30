exports.notFound = (req,res)=> res.status(404).send('Page introuvable');
exports.onError = (err,req,res,next)=>{
  console.error(err);
  res.status(500).send('Erreur serveur');
};