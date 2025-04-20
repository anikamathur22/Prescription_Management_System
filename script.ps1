# Get all files recursively
$files = Get-ChildItem -Recurse -File

# Loop through each file
foreach ($file in $files) {
    Write-Host "Checking file: $($file.FullName)"
    try {
        # Try to read the file as UTF-8
        $reader = [System.IO.StreamReader]::new($file.FullName, [System.Text.Encoding]::UTF8, $true)
        while ($null -ne $reader.ReadLine()) { }
        $reader.Close()
    } catch {
        # If an error occurs (non-UTF-8 file), print the message
        Write-Host "❌ Non-UTF8 file: $($file.FullName)"
    }
}

Write-Host "File check completed."
