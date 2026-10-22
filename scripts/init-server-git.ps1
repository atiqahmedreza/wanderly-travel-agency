Set-Location "$PSScriptRoot\..\server"
$env:GIT_AUTHOR_NAME = 'Wanderly Dev'
$env:GIT_AUTHOR_EMAIL = 'dev@wanderly.com'
$env:GIT_COMMITTER_NAME = 'Wanderly Dev'
$env:GIT_COMMITTER_EMAIL = 'dev@wanderly.com'
if (-not (Test-Path .git)) { git init | Out-Null }

function Commit-Group($paths, $message) {
  git add $paths 2>$null
  git diff --cached --quiet
  if ($LASTEXITCODE -ne 0) { git commit -m $message }
}

Commit-Group @('package.json', '.env.example', 'README.md', '.gitignore') 'chore: bootstrap wanderly API project'
Commit-Group @('src/config') 'feat: add MongoDB connection config'
Commit-Group @('src/models/User.js', 'src/models/Category.js', 'src/models/Destination.js') 'feat: add user, category, and destination models'
Commit-Group @('src/models/Package.js', 'src/models/Review.js', 'src/models/Booking.js') 'feat: add package, review, and booking models'
Commit-Group @('src/models/BlogPost.js', 'src/models/ContactMessage.js', 'src/models/NewsletterSubscriber.js') 'feat: add blog, contact, and newsletter models'
Commit-Group @('src/utils', 'src/middleware') 'feat: add JWT utilities, auth middleware, and error handling'
Commit-Group @('src/controllers/authController.js') 'feat: implement registration, login, and profile endpoints'
Commit-Group @('src/controllers/packageController.js', 'src/controllers/statsController.js') 'feat: add package listing and public stats APIs'
Commit-Group @('src/controllers/bookingController.js') 'feat: integrate Stripe checkout and booking management'
Commit-Group @('src/controllers/reviewController.js', 'src/controllers/wishlistController.js', 'src/controllers/metaController.js') 'feat: add reviews, wishlist, blog, and contact APIs'
Commit-Group @('src/routes/index.js', 'src/index.js') 'feat: wire Express app, CORS, and API routes'
Commit-Group @('src/seed') 'feat: seed 25 tour packages with reviews and bookings'

Write-Host "Server commits:" (git rev-list --count HEAD)
